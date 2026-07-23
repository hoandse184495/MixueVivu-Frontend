import { Text, TouchableOpacity, View } from 'react-native';
import { TABS } from './constants';
import { styles } from './styles';

export default function TourTabBar({ activeTab, colors, onChangeTab }) {
    return (
        <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border + '50' }]}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => onChangeTab(tab.key)}
            >
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
    );
}
