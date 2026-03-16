import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import { getInspectionObservations } from '@/shared/models/observation';
import { createScopeItemsBatch, getInspectionScopeItems } from '@/shared/models/scope_item';
import rules from '@/lib/rules.json';

/**
 * Check if an observation matches a rule's conditions
 */
function matchesRule(
  observation: { component?: string | null; damage?: string | null; severity?: string | null },
  conditions: { damage?: string[]; component?: string[] }
): boolean {
  const { component, damage } = observation;

  // Check component match
  if (conditions.component && conditions.component.length > 0) {
    const componentLower = component?.toLowerCase() || '';
    const componentMatch = conditions.component.some((c) =>
      componentLower.includes(c.toLowerCase())
    );
    if (!componentMatch) return false;
  }

  // Check damage match
  if (conditions.damage && conditions.damage.length > 0) {
    const damageLower = damage?.toLowerCase() || '';
    const damageMatch = conditions.damage.some((d) =>
      damageLower.includes(d.toLowerCase())
    );
    if (!damageMatch) return false;
  }

  return true;
}

/**
 * Generate a unique key for a scope item to prevent duplicates
 */
function getScopeItemKey(ruleId: string, observation: { component?: string | null; location?: string | null }): string {
  return `${ruleId}_${observation.component || 'unknown'}_${observation.location || 'general'}`;
}

/**
 * Run rule engine on observations and generate scope items
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { inspectionId } = body;

    if (!inspectionId) {
      return NextResponse.json(
        { error: 'Missing inspection_id' },
        { status: 400 }
      );
    }

    // Get all observations for the inspection
    const observations = await getInspectionObservations(inspectionId);

    if (!observations || observations.length === 0) {
      return NextResponse.json({
        success: true,
        scopeItems: [],
        message: 'No observations found for this inspection',
      });
    }

    // Get existing scope items to avoid duplicates
    const existingScopeItems = await getInspectionScopeItems(inspectionId);
    const existingKeys = new Set(
      existingScopeItems.map((item) => getScopeItemKey(item.xactimateCode || '', {
        component: null,
        location: null,
      }))
    );

    // Match rules to observations
    const matchedScopeItems = new Map<string, any>();
    const matchedObservations = new Map<string, any[]>();

    // Initialize observation tracking
    observations.forEach((obs) => {
      const key = getScopeItemKey('obs', { component: obs.component, location: obs.location });
      if (!matchedObservations.has(key)) {
        matchedObservations.set(key, []);
      }
      matchedObservations.get(key)!.push(obs);
    });

    // Apply rules
    for (const observation of observations) {
      for (const rule of rules) {
        if (matchesRule(observation, rule.conditions)) {
          const scopeKey = getScopeItemKey(rule.id, {
            component: observation.component,
            location: observation.location,
          });

          // Skip if already matched
          if (matchedScopeItems.has(scopeKey)) {
            continue;
          }

          // Skip if already exists in database
          const existingKey = getScopeItemKey(rule.xactimateCode, {
            component: observation.component,
            location: observation.location,
          });
          if (existingKeys.has(existingKey)) {
            continue;
          }

          // Create scope item
          matchedScopeItems.set(scopeKey, {
            inspectionId,
            xactimateCode: rule.xactimateCode,
            lineItem: rule.lineItem,
            description: null, // Will be filled by scope-describe API
            priority: rule.priority,
            category: rule.category,
            ruleId: rule.id,
            confirmed: false,
            deleted: false,
          });

          // Track which observations matched this rule
          const obsKey = getScopeItemKey('obs', {
            component: observation.component,
            location: observation.location,
          });
          if (!matchedObservations.has(obsKey)) {
            matchedObservations.set(obsKey, []);
          }
          matchedObservations.get(obsKey)!.push(observation);
        }
      }
    }

    // Save to database
    const scopeItemsToCreate = Array.from(matchedScopeItems.values());

    if (scopeItemsToCreate.length > 0) {
      await createScopeItemsBatch(scopeItemsToCreate);
    }

    return NextResponse.json({
      success: true,
      inspectionId,
      scopeItems: scopeItemsToCreate,
      totalObservations: observations.length,
      matchedScopeItems: scopeItemsToCreate.length,
      rules: {
        total: rules.length,
        applied: scopeItemsToCreate.length,
      },
    });
  } catch (error) {
    console.error('[Rule Engine] Error:', error);
    return NextResponse.json(
      { error: 'Failed to run rule engine' },
      { status: 500 }
    );
  }
}

/**
 * Get available rules
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    rules,
    total: rules.length,
  });
}
