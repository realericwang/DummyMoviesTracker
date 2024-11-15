import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { colors, spacing } from "../styles/globalStyles";
import { getImageUrl } from "../api/tmdbApi";
import { useNavigation } from "@react-navigation/native";
/**
 * BannerRotator component for displaying a rotating banner of movie or TV show images.
 *
 * This component uses a horizontally scrolling ScrollView to display a series of movie banners.  It automatically rotates through the banners at intervals and includes pagination dots to indicate the current banner.  Handles navigation to movie or TV show detail screens.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.movies - An array of movie or TV show objects, each with `backdrop_path`, `title`/`name`, and `vote_average` properties.
 * @returns {JSX.Element} The BannerRotator component.
 */
export default function BannerRotator({ movies }) {
  const navigation = useNavigation();
  const scrollX = new Animated.Value(0);
  const { width } = Dimensions.get("window");
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let scrollInterval;
    if (movies.length > 0) {
      scrollInterval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % movies.length;
        setCurrentIndex(nextIndex);
        scrollViewRef.current?.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
      }, 5000);
    }
    return () => clearInterval(scrollInterval);
  }, [currentIndex, movies]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offset = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(offset / width);
        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
        }
      },
    }
  );

  const handleBannerPress = (movie) => {
    const isTV = movie.first_air_date !== undefined;
    navigation.navigate(
      isTV ? "TVShowDetail" : "MovieDetail",
      isTV ? { showId: movie.id } : { movieId: movie.id }
    );
  };

  return (
    <View style={styles.bannerContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="center"
        contentContainerStyle={{ flexGrow: 0 }}
      >
        {movies.map((movie, index) => (
          <TouchableOpacity
            key={movie.id}
            style={[styles.bannerSlide, { width: width }]}
            onPress={() => handleBannerPress(movie)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: getImageUrl(movie.backdrop_path) }}
              style={styles.bannerImage}
            />
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>
                {movie.title || movie.name}
              </Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>
                  ★ {movie.vote_average.toFixed(1)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.pagination}>
        {movies.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: "clamp",
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              key={index}
              style={[styles.dot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    height: 200,
    position: "relative",
    marginBottom: spacing.lg,
  },
  bannerSlide: {
    height: 200,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)",
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: spacing.xs,
    textShadow: "0px 2px 4px rgba(0,0,0,0.2)",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  rating: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: spacing.sm,
    alignSelf: "center",
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFF",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
