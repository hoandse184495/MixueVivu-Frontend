import { Image, StyleSheet, Text, View } from 'react-native';
import { formatBookingCode, formatPaymentCode, getQrImageUrl, getTransferContent, } from '../../utils/bookingDisplay';
const COLORS = {
    primary: '#0058bc',
    text: '#191c1e',
    textMuted: '#717786',
};
export default function PaymentTransferCard({ bookingId, paymentId, amount, compact = false, }) {
    const total = Number(amount || 0);
    return (<View>
      <View style={styles.qrWrap}>
        <Image source={{ uri: getQrImageUrl({ bookingId, amount: total }) }} style={[styles.qrImage, compact && styles.qrImageCompact]}/>
      </View>
      <InfoRow label="Mã booking" value={formatBookingCode(bookingId)}/>
      <InfoRow label="Mã thanh toán" value={formatPaymentCode(paymentId)}/>
      <InfoRow label="Ngân hàng" value="MixueVivu Bank"/>
      <InfoRow label="Số tài khoản" value="88889999"/>
      <InfoRow label="Nội dung" value={getTransferContent(bookingId)}/>
      <InfoRow label="Số tiền" value={`${total.toLocaleString('vi-VN')}₫`} valueStyle={styles.amountText}/>
    </View>);
}
function InfoRow({ label, value, valueStyle, }) {
    return (<View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
    </View>);
}
const styles = StyleSheet.create({
    qrWrap: {
        alignItems: 'center',
        marginBottom: 14,
    },
    qrImage: {
        width: 180,
        height: 180,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    qrImageCompact: {
        width: 150,
        height: 150,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#edf1f6',
    },
    infoLabel: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: '700',
    },
    infoValue: {
        flex: 1,
        textAlign: 'right',
        color: COLORS.text,
        fontSize: 13,
        fontWeight: '800',
    },
    amountText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '900',
    },
});
