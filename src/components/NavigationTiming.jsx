import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

function useNavigationTiming() {
  const navigation = useNavigation();

  useEffect(() => {
    let startTime;

    const unsubscribeStart = navigation.addListener('transitionStart', () => {
      startTime = Date.now();
    });

    const unsubscribeEnd = navigation.addListener('transitionEnd', () => {
      if (startTime) {
        const endTime = Date.now();
        console.log('Navigation took:', endTime - startTime, 'ms');
      }
    });

    // Cleanup listeners jab component unmount ho jaye
    return () => {
      unsubscribeStart();
      unsubscribeEnd();
    };
  }, [navigation]);
}

export default NavigationTiming;
