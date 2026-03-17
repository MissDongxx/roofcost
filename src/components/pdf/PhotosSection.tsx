import { View, Text, StyleSheet, Image } from '@react-pdf/renderer';

interface Photo {
  id: string;
  photoType: string;
  storageUrl: string;
  processedUrl: string | null;
  annotatedUrl: string | null;
  gps: string | null;
  uploadedAt: Date | string;
}

interface PhotosSectionProps {
  photos: Photo[];
}

export default function PhotosSection({ photos }: PhotosSectionProps) {
  // Use annotated URL if available, otherwise processed URL, otherwise original URL
  const getDisplayUrl = (photo: Photo) => {
    return photo.annotatedUrl || photo.processedUrl || photo.storageUrl;
  };

  // Group photos by type
  const groupedPhotos = photos.reduce((acc, photo) => {
    const type = photo.photoType || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(photo);
    return acc;
  }, {} as Record<string, Photo[]>);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Photo Documentation</Text>
      <Text style={styles.subheader}>Visual Record of Inspection Findings</Text>

      <View style={styles.content}>
        {Object.entries(groupedPhotos).map(([type, typePhotos]) => (
          <View key={type} style={styles.photoGroup}>
            <Text style={styles.groupTitle}>
              {formatPhotoType(type)}
            </Text>
            <View style={styles.photoGrid}>
              {typePhotos.map((photo) => (
                <View key={photo.id} style={styles.photoCard}>
                  <Image
                    src={getDisplayUrl(photo)}
                    style={styles.photo}
                  />
                  <Text style={styles.photoLabel}>
                    {formatPhotoType(type)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {photos.length} photos documented during inspection
        </Text>
      </View>
    </View>
  );
}

function formatPhotoType(type: string): string {
  const names: Record<string, string> = {
    overview: 'Property Overview',
    north_side: 'North Side',
    south_side: 'South Side',
    east_side: 'East Side',
    west_side: 'West Side',
    flashing: 'Flashing Details',
    valley: 'Valley Areas',
    chimney: 'Chimney & Penetrations',
    gutters: 'Gutters & Downspouts',
    ventilation: 'Ventilation',
    close_up_damage: 'Close-up: Damage',
    close_up_material: 'Close-up: Material',
    miscellaneous: 'Additional Photos',
  };
  return names[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

const styles = StyleSheet.create({
  container: {
    padding: 60,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 5,
  },
  subheader: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 40,
  },
  content: {
    marginBottom: 30,
  },
  photoGroup: {
    marginBottom: 30,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 15,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  photoCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 20,
  },
  photo: {
    width: '100%',
    height: 180,
    objectFit: 'cover',
    borderRadius: 4,
  },
  photoLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
