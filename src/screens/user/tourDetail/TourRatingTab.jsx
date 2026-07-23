import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from './constants';
import { styles } from './styles';

export default function TourRatingTab({
    reviews,
    colors,
    reviewText,
    reviewRating,
    submittingReview,
    onChangeReviewText,
    onChangeReviewRating,
    onSubmitReview,
}) {
    return (
        <View style={{ padding: 16 }}>
          <View style={styles.reviewForm}>
            <Text style={styles.reviewFormTitle}>✍️ Viết đánh giá</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => onChangeReviewRating(star)} style={styles.starBtn}>
                  <Text style={[styles.starText, { color: star <= reviewRating ? '#F59E0B' : '#D1D5DB' }]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.ratingNum}>{reviewRating}/5</Text>
            </View>
            <TextInput
              style={styles.reviewInput}
              placeholder="Chia sẻ cảm nhận của bạn về tour này..."
              placeholderTextColor={COLORS.textMuted}
              value={reviewText}
              onChangeText={onChangeReviewText}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={[styles.submitBtn, submittingReview && { opacity: 0.7 }]}
              onPress={onSubmitReview}
              disabled={submittingReview}
            >
              <Text style={styles.submitBtnText}>
                {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.reviewsCount}>Đánh giá ({reviews.length})</Text>
          {reviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 36 }}>⭐</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Chưa có đánh giá nào</Text>
            </View>
          ) : (
            reviews.map((review, idx) => (
              <View key={idx} style={[styles.reviewCard, { backgroundColor: colors.surface }]}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 16 }}>
                      {review.userName?.[0] || 'U'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewUser}>{review.userName || 'Người dùng'}</Text>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Text key={star} style={{ fontSize: 12, color: star <= review.rating ? '#F59E0B' : '#D1D5DB' }}>★</Text>
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))
          )}
        </View>
    );
}
