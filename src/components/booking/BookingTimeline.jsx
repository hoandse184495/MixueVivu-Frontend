import { StyleSheet, Text, View } from 'react-native';
import { getBookingTimeline } from '../../utils/bookingDisplay';
const COLORS = {
    success: '#006c4b',
    error: '#ba1a1a',
    textMuted: '#717786',
};
export default function BookingTimeline({ bookingStatus, paymentStatus }) {
    const timeline = getBookingTimeline({ bookingStatus, paymentStatus });
    return (<View>
      {timeline.map((step, index) => (<View key={step.key} style={styles.row}>
          <View style={[
                styles.dot,
                step.done && styles.dotDone,
                step.danger && styles.dotDanger,
            ]}>
            <Text style={styles.dotText}>{step.done ? '✓' : index + 1}</Text>
          </View>
          <Text style={[
                styles.text,
                step.done && styles.textDone,
                step.danger && styles.textDanger,
            ]}>
            {step.label}
          </Text>
        </View>))}
    </View>);
}
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    dot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#eef1f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dotDone: {
        backgroundColor: COLORS.success,
    },
    dotDanger: {
        backgroundColor: COLORS.error,
    },
    dotText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
    },
    text: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontWeight: '700',
    },
    textDone: {
        color: COLORS.success,
    },
    textDanger: {
        color: COLORS.error,
    },
});
