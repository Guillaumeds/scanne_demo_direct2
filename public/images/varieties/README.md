# Sugarcane Variety Images

This directory contains images for sugarcane varieties used in the variety selector.

## Current Images Available

The following varieties have image paths configured:

1. **m-2283-98.jpg** - M 2283/98 variety
2. **m-1392-00.jpg** - M 1392/00 variety

## All Varieties Needing Images

The complete list of sugarcane varieties that could have images:

- M 3035/66, M 695/69, M 1557/70, M 1176/77, M 52/78, M 1658/78
- M 96/82, M 1246/84, M 387/85, M 1186/86, M 1394/86, M 1400/86
- M 2024/88, M 2256/88, M 703/89, M 1861/89, M 2238/89, M 1672/90
- M 2593/92, M 2283/98, M 683/99, M 1989/99, M 2502/99, M 1392/00
- M 1561/01, M 216/02, M 1002/02, M 1698/02, M 1256/04, M 915/05
- M 63, M 64, M 65, R570, R573, R575, R579

## Image Requirements

- **Format**: JPG or PNG
- **Size**: Recommended 300x300px minimum
- **Quality**: High resolution for clear display
- **Content**: Show the sugarcane plant/stalks clearly
- **Naming**: Use the variety ID format (e.g., m-2283-98.jpg for M 2283/98)

## Sources

- Use existing variety leaflets from the `public/sugarcane_varieties_leaflets` directory
- Extract images from PDF leaflets if available
- Use photos from field trials or research documentation
- Ensure proper licensing for any external images

## Adding New Images

1. Add the image file to this directory
2. Update the variety data in `src/types/varieties.ts` to include the image path
3. Use the format: `image: '/images/varieties/variety-id.jpg'`

## Fallback

If specific variety images are not available, the variety selector will display without images and use emoji icons instead (🌾 for sugarcane varieties).
