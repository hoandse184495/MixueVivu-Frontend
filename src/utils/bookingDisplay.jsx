export const formatBookingCode = (id) => `MVV-BK-${String(id || 0).padStart(5, '0')}`;
export const formatPaymentCode = (id) => `MVV-PAY-${String(id || 0).padStart(5, '0')}`;
export const getTransferContent = (bookingId) => `BOOKING-${bookingId || ''}`;
export const getQrImageUrl = ({ bookingId, amount, }) => {
    const payload = JSON.stringify({
        app: 'MixueVivu',
        booking: getTransferContent(bookingId),
        amount: Number(amount || 0),
        bank: 'MixueVivu Bank',
        account: '88889999',
    });
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payload)}`;
};
export const getBookingTimeline = ({ bookingStatus, paymentStatus, }) => {
    const isCancelled = bookingStatus === 'cancelled';
    return [
        {
            key: 'created',
            label: 'Đã đặt',
            done: true,
        },
        {
            key: 'provider',
            label: isCancelled ? 'Provider từ chối/hủy' : 'Provider xác nhận',
            done: ['confirmed', 'completed', 'cancelled'].includes(bookingStatus || ''),
            danger: isCancelled,
        },
        {
            key: 'submitted',
            label: 'Khách báo đã chuyển',
            done: ['submitted', 'paid', 'refunded'].includes(paymentStatus || ''),
        },
        {
            key: 'paid',
            label: paymentStatus === 'refunded' ? 'Đã hoàn tiền' : 'Manager xác nhận tiền',
            done: ['paid', 'refunded'].includes(paymentStatus || ''),
            danger: paymentStatus === 'refunded',
        },
        {
            key: 'completed',
            label: 'Hoàn thành',
            done: bookingStatus === 'completed',
        },
        {
            key: 'payout',
            label: 'Payout provider',
            done: bookingStatus === 'completed',
        },
    ];
};
