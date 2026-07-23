import { Text, View } from 'react-native';
import { TourImage } from '../../../components/TourImage';
import { styles } from './styles';

export default function TourActivitiesTab({ groupedActivities, colors }) {
    return (
        <View style={{ padding: 16 }}>
          {Object.keys(groupedActivities).length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40 }}>📅</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Chưa có lịch trình</Text>
            </View>
          ) : (
            Object.entries(groupedActivities).map(([day, acts], dayIdx) => (
              <View key={day} style={styles.dayBlock}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayDot}>
                    <Text style={styles.dayDotText}>{dayIdx + 1}</Text>
                  </View>
                  <Text style={styles.dayTitle}>{day}</Text>
                </View>
                <View style={styles.dayActivities}>
                  {acts.map((act, idx) => (
                    <View key={idx} style={[styles.activityCard, { backgroundColor: colors.surface }]}>
                      {act.image ? <TourImage uri={act.image} style={styles.activityImage} /> : null}
                      {act.time ? <Text style={styles.actTime}>🕐 {act.time}</Text> : null}
                      <Text style={styles.actTitle}>{act.title}</Text>
                      {act.description ? <Text style={styles.actDesc}>{act.description}</Text> : null}
                      {act.location ? <Text style={styles.actLocation}>📍 {act.location}</Text> : null}
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
    );
}
