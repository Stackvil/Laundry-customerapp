# 📸🎥 Image/Video Upload Feature - Complete Guide

## ✅ Feature Implemented!

Users can now choose between uploading **multiple images** or a **single video** based on the number of items they have.

---

## 🎯 Feature Overview

### Two Upload Options:

#### 1. **Less than 10 items** → Upload Images 📸
- Users can take multiple photos of their items
- Each item can be photographed individually
- Images can be reviewed and removed
- Perfect for small orders

#### 2. **More than 10 items** → Upload Video 🎥
- Users record a single video of all items
- Items should be spread out neatly
- Maximum video duration: 60 seconds
- Perfect for large orders

---

## 📱 User Flow

### Step 1: Confirm Order Screen
```
User arrives at Confirm Order
    ↓
Scrolls to "Upload Your Items" section
    ↓
Sees two buttons:
  - "Less than 10 items"
  - "More than 10 items"
```

### Step 2: Select Option

#### Option A: Less than 10 Items
```
Click "Less than 10 items"
    ↓
Button becomes active (highlighted)
    ↓
See instruction: "📸 Upload all your items images clearly"
    ↓
"Take Photo" button appears
    ↓
Click to open camera
    ↓
Take photo
    ↓
Photo appears in grid
    ↓
Repeat for more items
    ↓
See count: "3 image(s) uploaded"
```

#### Option B: More than 10 Items
```
Click "More than 10 items"
    ↓
Button becomes active (highlighted)
    ↓
See instructions:
  "🎥 Spread your items neatly and take a clear video"
  • Spread all items on a clean surface
  • Record a slow pan video (max 60 seconds)
  • Ensure good lighting for clarity
    ↓
"Record Video" button appears (blue)
    ↓
Click to open camera in video mode
    ↓
Record video
    ↓
Video confirmation appears
    ↓
See message: "Video recorded successfully"
```

### Step 3: Review & Submit
```
Review uploaded images/video
    ↓
Can remove items if needed
    ↓
Click "Confirm Order"
    ↓
Order is placed
```

### Step 4: View in Order Details
```
Go to Orders tab
    ↓
Tap on order
    ↓
See uploaded images OR video
    ↓
For images: Tap to view full screen
For video: Tap to play
```

---

## 🎨 UI Design

### Quantity Selection Buttons
```
┌──────────────────────┬──────────────────────┐
│  Less than 10 items  │  More than 10 items  │
│    (Image mode)      │    (Video mode)      │
└──────────────────────┴──────────────────────┘
```

**Active button:**
- Darker border (black)
- Light gray background
- Bold text

**Inactive button:**
- Light border
- White background
- Normal text

### Image Upload Mode
```
┌─────────────────────────────────────────┐
│ 📸 Upload all your items images clearly│
│                                         │
│  ┌───────────────────────────────────┐ │
│  │      📷 Take Photo                │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌────┐ ┌────┐ ┌────┐                 │
│  │img1│ │img2│ │img3│  ...            │
│  │ ✕  │ │ ✕  │ │ ✕  │                 │
│  └────┘ └────┘ └────┘                 │
│                                         │
│       3 image(s) uploaded              │
└─────────────────────────────────────────┘
```

### Video Upload Mode
```
┌─────────────────────────────────────────┐
│ 🎥 Spread your items neatly and take   │
│    a clear video                        │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ • Spread all items on clean surface││
│ │ • Record slow pan (max 60 seconds) ││
│ │ • Ensure good lighting              ││
│ └─────────────────────────────────────┘│
│                                         │
│  ┌───────────────────────────────────┐ │
│  │      📹 Record Video              │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │       📹                            ││
│  │  Video recorded successfully        ││
│  │  ┌─────────────────────┐           ││
│  │  │   Remove Video      │           ││
│  │  └─────────────────────┘           ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## 💻 Technical Implementation

### Files Modified

#### 1. `app/confirm-order.tsx`
**Changes:**
- Added `uploadType` state ('images' | 'video')
- Added `videoUri` state
- Added quantity selection buttons
- Created `handlePickVideo()` function
- Created `handleRemoveImage()` and `handleRemoveVideo()` functions
- Updated validation to check uploadType
- Added conditional rendering for images/video sections
- Added new styles for buttons and video preview

**Key Functions:**
```typescript
const [uploadType, setUploadType] = useState<'images' | 'video' | null>(null);
const [images, setImages] = useState<string[]>([]);
const [videoUri, setVideoUri] = useState<string>('');

// Pick video from camera
const handlePickVideo = async () => {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    videoMaxDuration: 60,
  });
  if (!result.canceled) setVideoUri(result.assets[0].uri);
};
```

#### 2. `app/order-placed.tsx`
**Changes:**
- Added `videoUri` and `uploadType` to order parameters
- Updated order object to include video data
- Saves both images and video to AsyncStorage

**Order Structure:**
```typescript
{
  id: string,
  images: string[],
  videoUri: string,
  uploadType: 'images' | 'video',
  // ... other fields
}
```

#### 3. `app/(tabs)/orders/[id].tsx`
**Changes:**
- Added `Video` component import from expo-av
- Conditional rendering based on `uploadType`
- Display images in grid with tap to enlarge
- Display video player with controls
- Added upload type labels
- Added new styles for video player

**Display Logic:**
```typescript
{order.uploadType === 'images' && (
  // Show image grid
)}

{order.uploadType === 'video' && (
  // Show video player
)}
```

---

## 📊 Features & Capabilities

### Image Upload
| Feature | Details |
|---------|---------|
| Multiple Photos | ✅ Yes, unlimited |
| Remove Image | ✅ Tap ✕ button |
| Full Screen View | ✅ Tap image in order details |
| Image Quality | 70% compression |
| Image Count | Displayed below grid |

### Video Upload
| Feature | Details |
|---------|---------|
| Max Duration | 60 seconds |
| Video Controls | ✅ Play, pause, seek |
| Remove Video | ✅ Yes, before submission |
| Video Quality | 70% compression |
| Playback | Loop enabled in order details |

---

## 🎯 User Instructions

### For Less Than 10 Items (Images):

**Instructions shown to user:**
> 📸 Upload all your items images clearly

**Steps:**
1. Click "Less than 10 items" button
2. Click "Take Photo" button
3. Take clear photos of each item
4. Review photos in grid
5. Remove any unwanted photos (tap ✕)
6. Upload more photos as needed
7. Proceed to confirm order

**Best Practices:**
- Take photos in good lighting
- Capture each item clearly
- Include all items
- Remove blurry photos

### For More Than 10 Items (Video):

**Instructions shown to user:**
> 🎥 Spread your items neatly and take a clear video
> 
> • Spread all items on a clean surface  
> • Record a slow pan video (max 60 seconds)  
> • Ensure good lighting for clarity

**Steps:**
1. Click "More than 10 items" button
2. Spread all items on a clean, flat surface
3. Click "Record Video" button
4. Record a slow pan across all items
5. Keep camera steady
6. Stop recording (max 60 seconds)
7. Review video confirmation
8. Remove and re-record if needed
9. Proceed to confirm order

**Best Practices:**
- Use good lighting
- Spread items neatly
- Pan slowly across all items
- Keep camera steady
- Stay within 60 seconds
- Show all items clearly

---

## 📱 Order Display

### In Confirm Order Screen:
- Shows selected upload type
- Displays uploaded images in grid OR
- Shows video confirmation message

### In Orders List:
- No change to list view
- Order details accessible as normal

### In Order Details Page:

#### For Image Orders:
```
┌─────────────────────────────────────┐
│ Uploaded Items Images               │
│ 📸 Less than 10 items              │
│                                     │
│ ┌────┐ ┌────┐ ┌────┐              │
│ │    │ │    │ │    │              │
│ └────┘ └────┘ └────┘              │
│                                     │
│ 3 image(s)                         │
└─────────────────────────────────────┘
```

#### For Video Orders:
```
┌─────────────────────────────────────┐
│ Uploaded Items Video                │
│ 🎥 More than 10 items              │
│                                     │
│ ┌─────────────────────────────────┐│
│ │                                 ││
│ │     VIDEO PLAYER                ││
│ │     [Play controls]             ││
│ │                                 ││
│ └─────────────────────────────────┘│
│                                     │
│ Tap to play video                  │
└─────────────────────────────────────┘
```

---

## 🔧 Validation

### Upload Type Selection:
```javascript
if (!uploadType) {
  Alert: "Please select items quantity and upload images or video"
}
```

### Images Validation:
```javascript
if (uploadType === 'images' && images.length === 0) {
  Alert: "Please upload at least one image of your items"
}
```

### Video Validation:
```javascript
if (uploadType === 'video' && !videoUri) {
  Alert: "Please record a video of your items"
}
```

---

## 🎨 Styling Details

### Quantity Buttons:
- **Container**: Row layout with 10px gap
- **Button**: Flex 1, border 2px, rounded 8px
- **Active**: Black border, light gray background
- **Inactive**: Gray border, white background
- **Text**: 13px, centered

### Image Grid:
- **Layout**: Row wrap with 8px gap
- **Image**: 80x80px, rounded corners
- **Remove button**: Red circle, top-right corner
- **Count**: Centered, gray text

### Video Section:
- **Instructions**: Light gray background, rounded
- **Record button**: Blue background (#007AFF)
- **Preview**: Dashed border, blue accent
- **Player**: Black background, 250px height

---

## 📦 Data Storage

### AsyncStorage Structure:
```json
{
  "orders": [
    {
      "id": "1234567890",
      "uploadType": "images",
      "images": [
        "file:///path/to/image1.jpg",
        "file:///path/to/image2.jpg"
      ],
      "videoUri": "",
      "// ... other fields"
    },
    {
      "id": "1234567891",
      "uploadType": "video",
      "images": [],
      "videoUri": "file:///path/to/video.mp4",
      "// ... other fields"
    }
  ]
}
```

---

## ✅ Testing Checklist

### Image Upload Test:
- [ ] Click "Less than 10 items"
- [ ] Button becomes active
- [ ] "Take Photo" button appears
- [ ] Camera opens
- [ ] Photo is captured
- [ ] Photo appears in grid
- [ ] Can take multiple photos
- [ ] Can remove photos
- [ ] Counter updates
- [ ] Photos visible in order details
- [ ] Can tap to enlarge

### Video Upload Test:
- [ ] Click "More than 10 items"
- [ ] Button becomes active
- [ ] Instructions appear
- [ ] "Record Video" button appears
- [ ] Camera opens in video mode
- [ ] Video is recorded
- [ ] Confirmation appears
- [ ] Can remove and re-record
- [ ] Video visible in order details
- [ ] Video plays with controls

### Validation Test:
- [ ] Can't submit without selecting type
- [ ] Can't submit images mode with no images
- [ ] Can't submit video mode with no video
- [ ] Proper error messages appear

---

## 🎉 Success!

You now have a complete image/video upload system that:
- ✅ Adapts to order size
- ✅ Guides users with clear instructions
- ✅ Provides proper validation
- ✅ Displays media beautifully
- ✅ Works seamlessly with order flow

Users can efficiently document their items whether they have 5 shirts or 50!

