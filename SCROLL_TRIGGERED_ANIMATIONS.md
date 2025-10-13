# 📜 Scroll-Triggered Animations

## ✅ Implemented Successfully!

Your LaundryPoint app now has **scroll-triggered motion animations** that bring content to life as users scroll through lists!

---

## 🎯 What's Been Added

### **1. ScrollTriggeredView Component** (`components/Animated/ScrollTriggeredView.tsx`)
A powerful component that animates elements based on scroll position, creating engaging parallax and reveal effects.

### **2. useScrollTrigger Hook**
A custom hook that tracks scroll position and provides handlers for scroll-based animations.

### **3. Applied to Services Page**
The laundry services page (`app/(tabs)/home/shop/services/[id].tsx`) now features beautiful scroll-triggered animations for shop cards.

---

## 🎨 Animation Types Available

### **fadeInUp** (Default)
Content fades in and slides up as you scroll
- **Best for:** Lists, cards, content blocks
- **Effect:** Opacity 0→1, TranslateY 50→0

### **fadeInLeft**
Content fades in and slides from left
- **Best for:** Alternating content, side panels
- **Effect:** Opacity 0→1, TranslateX -50→0

### **fadeInRight**
Content fades in and slides from right
- **Best for:** Alternating content, side panels  
- **Effect:** Opacity 0→1, TranslateX 50→0

### **scaleIn**
Content scales up and fades in
- **Best for:** Important items, featured content
- **Effect:** Opacity 0→1, Scale 0.8→1

### **slideInUp**
Content slides up (no fade)
- **Best for:** Full opacity reveals, panels
- **Effect:** TranslateY 80→0

---

## 📚 Usage Guide

### **Basic Usage**

```typescript
import { ScrollTriggeredView, useScrollTrigger } from '@/components/Animated';
import Animated from 'react-native-reanimated';

export default function MyScreen() {
  const { scrollY, scrollHandler } = useScrollTrigger();

  return (
    <Animated.ScrollView 
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    >
      {items.map((item, index) => (
        <ScrollTriggeredView
          key={item.id}
          index={index}
          scrollY={scrollY}
          itemHeight={120}
          animation="fadeInUp"
        >
          <ItemCard item={item} />
        </ScrollTriggeredView>
      ))}
    </Animated.ScrollView>
  );
}
```

### **Component Props**

```typescript
interface ScrollTriggeredViewProps {
  children: React.ReactNode;       // Content to animate
  index: number;                   // Item position in list
  scrollY: SharedValue<number>;    // Scroll position from hook
  itemHeight?: number;             // Height of each item (default: 120)
  animation?: AnimationType;       // Animation type (default: 'fadeInUp')
  style?: ViewStyle;               // Additional styles
}
```

### **Hook API**

```typescript
const { scrollY, scrollHandler } = useScrollTrigger();

// scrollY: SharedValue<number> - Current scroll position
// scrollHandler: Function - Pass to onScroll prop
```

---

## 🚀 Real-World Examples

### **Example 1: Service Centers List (Current Implementation)**

```typescript
export default function ServiceShopsScreen() {
  const { scrollY, scrollHandler } = useScrollTrigger();

  return (
    <Animated.ScrollView 
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    >
      {mockShops.map((shop, index) => (
        <ScrollTriggeredView 
          key={shop.id} 
          index={index} 
          scrollY={scrollY}
          itemHeight={108}
          animation="fadeInUp"
        >
          <AnimatedButton onPress={() => handleSelect(shop)}>
            <ShopCard shop={shop} />
          </AnimatedButton>
        </ScrollTriggeredView>
      ))}
    </Animated.ScrollView>
  );
}
```

**Result:** Each shop card fades in and slides up as you scroll, creating a smooth cascade effect.

---

### **Example 2: Alternating Animations**

```typescript
{products.map((product, index) => (
  <ScrollTriggeredView
    key={product.id}
    index={index}
    scrollY={scrollY}
    itemHeight={150}
    animation={index % 2 === 0 ? 'fadeInLeft' : 'fadeInRight'}
  >
    <ProductCard product={product} />
  </ScrollTriggeredView>
))}
```

**Result:** Products alternate sliding in from left and right, creating a dynamic zigzag effect.

---

### **Example 3: Featured Content**

```typescript
{featuredItems.map((item, index) => (
  <ScrollTriggeredView
    key={item.id}
    index={index}
    scrollY={scrollY}
    itemHeight={200}
    animation="scaleIn"
  >
    <FeaturedCard item={item} />
  </ScrollTriggeredView>
))}
```

**Result:** Featured items scale up dramatically as they come into view.

---

### **Example 4: Mixed Content with Different Heights**

```typescript
export default function FeedScreen() {
  const { scrollY, scrollHandler } = useScrollTrigger();

  return (
    <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
      {/* Header - Short */}
      <ScrollTriggeredView
        index={0}
        scrollY={scrollY}
        itemHeight={80}
        animation="fadeInDown"
      >
        <Header />
      </ScrollTriggeredView>

      {/* Banner - Tall */}
      <ScrollTriggeredView
        index={1}
        scrollY={scrollY}
        itemHeight={250}
        animation="scaleIn"
      >
        <Banner />
      </ScrollTriggeredView>

      {/* Posts - Medium */}
      {posts.map((post, index) => (
        <ScrollTriggeredView
          key={post.id}
          index={index + 2}
          scrollY={scrollY}
          itemHeight={120}
          animation="fadeInUp"
        >
          <PostCard post={post} />
        </ScrollTriggeredView>
      ))}
    </Animated.ScrollView>
  );
}
```

---

## 🎯 Animation Timing

The scroll-triggered animations use **interpolation** to create smooth transitions based on scroll position:

### **Input Range Calculation**
```typescript
const inputRange = [
  (index - 1) * itemHeight,  // Before item is visible
  index * itemHeight,         // Item comes into view
  (index + 1) * itemHeight,   // Item fully visible
];
```

### **Output Values**
- **Opacity:** 0 → 1 → 1 (invisible to visible)
- **TranslateY:** 50 → 0 → 0 (offset to normal position)
- **Scale:** 0.8 → 1 → 1 (smaller to normal size)

---

## 🎨 Customization Examples

### **Slower Reveal**
```typescript
<ScrollTriggeredView
  itemHeight={150}  // Larger height = longer reveal
  animation="fadeInUp"
>
```

### **Faster Reveal**
```typescript
<ScrollTriggeredView
  itemHeight={80}   // Smaller height = faster reveal
  animation="fadeInUp"
>
```

### **Combined with Button Animation**
```typescript
<ScrollTriggeredView {...scrollProps}>
  <AnimatedButton scaleValue={0.95} onPress={handlePress}>
    <Card />
  </AnimatedButton>
</ScrollTriggeredView>
```

---

## ⚡ Performance Tips

### **1. Set scrollEventThrottle**
```typescript
<Animated.ScrollView
  onScroll={scrollHandler}
  scrollEventThrottle={16}  // 60 FPS (16ms per frame)
>
```

### **2. Use Appropriate Item Heights**
```typescript
// Calculate actual item height including margins
const CARD_HEIGHT = 100;
const CARD_MARGIN = 12;
const ITEM_HEIGHT = CARD_HEIGHT + CARD_MARGIN;

<ScrollTriggeredView itemHeight={ITEM_HEIGHT} />
```

### **3. Avoid Complex Children**
Keep animated children lightweight for smooth 60 FPS performance.

### **4. Use with FlatList for Long Lists**
For very long lists (100+ items), consider combining with FlatList's built-in optimization.

---

## 🎬 Animation Flow

1. **User scrolls** down the page
2. **scrollHandler** updates `scrollY` shared value
3. **ScrollTriggeredView** interpolates scroll position
4. **Animated values** update based on item position
5. **React Native Reanimated** runs animation on UI thread (60 FPS)

---

## 🔧 Technical Details

### **Why Interpolate?**
Interpolation creates smooth transitions based on scroll position rather than discrete triggers, resulting in fluid, natural-feeling animations.

### **Extrapolate.CLAMP**
Ensures values don't go beyond defined ranges, preventing unexpected behavior when scrolling past content.

### **Animated.SharedValue**
Uses Reanimated's shared values for high-performance animations that run on the UI thread without JavaScript bridge overhead.

---

## 🎊 Benefits

### **User Experience**
✅ Content feels alive and responsive  
✅ Draws attention to new content naturally  
✅ Reduces cognitive load (progressive disclosure)  
✅ Creates delightful micro-interactions  
✅ Makes scrolling feel purposeful  

### **Performance**
✅ 60 FPS smooth animations  
✅ Runs on UI thread (no JS bridge)  
✅ Efficient interpolation calculations  
✅ Minimal impact on scroll performance  

### **Development**
✅ Simple, declarative API  
✅ Reusable component  
✅ Easy to customize  
✅ Works with existing components  
✅ TypeScript support  

---

## 📱 Applied To

### **Services Page** ✅
- Path: `app/(tabs)/home/shop/services/[id].tsx`
- Animation: `fadeInUp`
- Item Height: 108px
- Effect: Shop cards fade in and slide up as you scroll

---

## 🚀 Where to Add Next

### **Orders List**
```typescript
// app/(tabs)/orders/index.tsx
<ScrollTriggeredView animation="fadeInUp">
  <OrderCard />
</ScrollTriggeredView>
```

### **Product Grid**
```typescript
// app/(tabs)/home/shop/[id].tsx
<ScrollTriggeredView animation="scaleIn">
  <ServiceItemCard />
</ScrollTriggeredView>
```

### **Profile Settings**
```typescript
// app/profile/index.tsx
<ScrollTriggeredView animation="fadeInLeft">
  <SettingRow />
</ScrollTriggeredView>
```

---

## 🎨 Animation Combinations

### **Scroll + Press Animations**
```typescript
<ScrollTriggeredView scrollY={scrollY} index={index}>
  <AnimatedButton scaleValue={0.95}>
    <Card />
  </AnimatedButton>
</ScrollTriggeredView>
```

### **Scroll + Stagger for Grid**
```typescript
<View style={styles.grid}>
  {items.map((item, index) => (
    <ScrollTriggeredView
      key={item.id}
      index={Math.floor(index / 2)} // 2 columns
      scrollY={scrollY}
    >
      <StaggeredListItem index={index % 2}>
        <GridItem />
      </StaggeredListItem>
    </ScrollTriggeredView>
  ))}
</View>
```

---

## 🎯 Best Practices

### ✅ DO
- Use `fadeInUp` for most lists
- Set correct `itemHeight` for smooth reveals
- Add `scrollEventThrottle={16}` for 60 FPS
- Combine with `AnimatedButton` for interactions
- Use alternating animations for visual interest

### ❌ DON'T
- Don't use for very short lists (< 3 items)
- Don't set itemHeight too small (causes jarring reveals)
- Don't animate heavy/complex components
- Don't forget to pass `scrollY` and `scrollHandler`
- Don't use different animations randomly (be consistent)

---

## 🎉 Result

Your LaundryPoint services page now features:

✅ **Smooth scroll-triggered animations**  
✅ **60 FPS performance** on UI thread  
✅ **Progressive content reveal**  
✅ **Professional, engaging feel**  
✅ **Easy to extend** to other screens  

The app feels **modern, responsive, and delightful**! 🚀✨

---

## 📦 Files Modified/Created

```
LaundryPoint1/
├── components/
│   └── Animated/
│       ├── ScrollTriggeredView.tsx   # ✨ NEW - Scroll animation component
│       └── index.ts                   # Updated - Export new component
├── app/
│   └── (tabs)/
│       └── home/
│           └── shop/
│               └── services/
│                   └── [id].tsx       # ✅ Updated - Uses scroll animations
└── SCROLL_TRIGGERED_ANIMATIONS.md    # ✨ NEW - This documentation
```

---

**Enjoy your beautifully animated scroll experience!** 🎬✨

