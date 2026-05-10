import logoImageFile from './logo1.png';
import backgroundImageFile from './wall3.png';

const signatureImageContext = require.context('./images', false, /\.(png|jpe?g|webp)$/i);
const signatureImages = signatureImageContext.keys().reduce((images, filePath) => {
  images[filePath] = signatureImageContext(filePath);
  return images;
}, {});

function compareFileNames(left, right) {
  return left.localeCompare(right, 'ko-KR', { numeric: true, sensitivity: 'base' });
}

function buildSignatureItems() {
  return signatureImageContext
    .keys()
    .map((filePath) => {
      const fileName = filePath.replace('./', '');

      return {
        fileName,
        image: signatureImageContext(filePath),
      };
    })
    .sort((a, b) => compareFileNames(a.fileName, b.fileName))
    .map((item, index) => ({
      id: `signature-${index + 1}`,
      title: item.fileName.replace(/\.[^.]+$/, ''),
      image: item.image,
      url: null,
    }));
}

export function getSignatureImage(imagePath, fileName) {
  const normalizedPath = imagePath?.replace(/^\.\/images\//, './');
  return signatureImages[normalizedPath] || signatureImages[`./${fileName}`] || imagePath;
}

export const siteAssets = {
  logoImage: logoImageFile,
  backgroundImage: backgroundImageFile,
};

export const navigationItems = [
  { label: '홈', page: 'home' },
  { label: '멤버', page: 'members' },
  { label: '시그니처', page: 'signatures' },
];

export const memberItems = [
  {
    id: 1,
    name: '혁민',
    profileImage: 'https://profile.img.sooplive.co.kr/LOGO/su/suhi370erw/suhi370erw.jpg',
    href: 'https://ch.sooplive.co.kr/suhi370erw',
  },
  {
    id: 2,
    name: '채무',
    profileImage: 'https://profile.img.sooplive.co.kr/LOGO/sj/sjm3000/sjm3000.jpg',
    href: 'https://ch.sooplive.co.kr/sjm3000',
  },
  {
    id: 3,
    name: '다나',
    profileImage: 'https://profile.img.sooplive.co.kr/LOGO/db/dbwls980305/dbwls980305.jpg',
    href: 'https://ch.sooplive.co.kr/dbwls980305',
  },
  {
    id: 4,
    name: '여리',
    profileImage: 'https://profile.img.sooplive.co.kr/LOGO/rk/rkddbsal9295/rkddbsal9295.jpg',
    href: 'https://ch.sooplive.co.kr/rkddbsal9295',
  },
  {
    id: 5,
    name: '유나',
    profileImage: 'https://profile.img.sooplive.co.kr/LOGO/wo/woglt2345/woglt2345.jpg',
    href: 'https://www.sooplive.com/station/woglt2345',
  },
  {
    id: 6,
    name: '달리',
    profileImage: 'https://profile.img.sooplive.co.kr/LOGO/co/coyduduuu/coyduduuu.jpg',
    href: 'https://ch.sooplive.co.kr/coyduduuu',
  },
  {
    id: 7,
    name: '어푸',
    profileImage: 'https://profile.img.sooplive.co.kr/LOGO/ju/jungsaehee91/jungsaehee91.jpg',
    href: 'https://ch.sooplive.co.kr/jungsaehee91',
  },
  {
    id: 8,
    name: '서냥',
    profileImage: 'https://profile.img.sooplive.co.kr/LOGO/se/seo5216/seo5216.jpg',
    href: 'https://ch.sooplive.co.kr/seo5216',
  },
  {
    id: 9,
    name: '던민',
    profileImage: 'https://profile.img.sooplive.co.kr/LOGO/ys/ysiliy1016/ysiliy1016.jpg',
    href: 'https://ch.sooplive.co.kr/ysiliy1016',
  },
  {
    id: 10,
    name: '주현',
    profileImage: 'https://profile.img.sooplive.co.kr/LOGO/wp/wpaud2004/wpaud2004.jpg',
    href: 'https://ch.sooplive.co.kr/wpaud2004',
  },
  {
    id: 11,
    name: '문어',
    profileImage: 'https://profile.img.sooplive.co.kr/LOGO/ki/ki9199/ki9199.jpg',
    href: 'https://ch.sooplive.co.kr/ki9199',
  },
  {
    id: 12,
    name: '재명',
    profileImage: 'https://profile.img.sooplive.co.kr/LOGO/lo/lovefm119/lovefm119.jpg',
    href: 'https://ch.sooplive.co.kr/lovefm119',
  },
];

export const signatureItems = buildSignatureItems();
