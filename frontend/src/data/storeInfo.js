export const STORE_INFO = {
  name: 'Sowmi Electronics',
  logo: '/soumi-logo.png',
  mark: '/soumi-mark.png',
  email: 'soumielectronics@gmail.com',
  phones: [
    { label: 'Sales', digits: '9894015373', display: '+91 98940 15373' },
    { label: 'Support', digits: '9080373534', display: '+91 90803 73534' },
    { label: 'Service', digits: '7010617961', display: '+91 70106 17961' },
  ],
  landline: { label: 'Store', digits: '04312700027', display: '0431 270 0027' },
  whatsappNumber: '919894015373',
  location: 'Super Bazaar, Trichy-8',
  address: 'Super Bazaar, Trichy-8, Tamil Nadu',
  cityState: 'Tiruchirappalli, Tamil Nadu',
  hours: 'Mon-Sat: 9:30 AM - 8:00 PM',
  tagline: 'Electronics | Computers | CCTV | Solar',
  summary:
    'Electronics, computers, CCTV, solar panels, and solar lights with dependable sales, service, wholesale, and retail support.',
  heroTitle: 'Computers, Solar Panels, LED TV and CCTV',
  heroText:
    'Sales, service, wholesale, and retail support for homes, offices, and shops across Trichy.',
  services: [
    'Computers',
    'Solar Panels',
    'Solar Lights',
    'LED TV',
    'Stabilizer & Stand',
    'All DTH STB',
    'CCTV',
  ],
  mapCoords: { lat: 10.8165, lon: 78.6918 },
}

export const CONTACT_NUMBERS = [...STORE_INFO.phones, STORE_INFO.landline].map((item) => ({
  ...item,
  tel: item.digits.startsWith('0') ? item.digits : `+91${item.digits}`,
}))
export const CONTACT_NUMBER_TEXT = CONTACT_NUMBERS.map((item) => item.display).join(' | ')

export const PRODUCT_CATEGORIES = [
  { name: 'Laptops', slug: 'laptops', image: '/categories/laptops.svg' },
  { name: 'Desktops', slug: 'desktops', image: '/categories/desktops.svg' },
  { name: 'Speakers', slug: 'speakers', image: '/categories/speakers.svg' },
  { name: 'Printers', slug: 'printers', image: '/categories/printers.svg' },
  { name: 'Solar', slug: 'solar', image: '/categories/solar.svg' },
  { name: 'CCTV', slug: 'cctv', image: '/categories/cctv.svg' },
  { name: 'Accessories', slug: 'accessories', image: '/categories/accessories.svg' },
]

export const QUICK_LINK_CATEGORIES = PRODUCT_CATEGORIES.filter(({ slug }) =>
  ['laptops', 'desktops', 'solar', 'cctv', 'accessories'].includes(slug)
)

export const CATEGORY_BRANDS = {
  laptops: ['HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Apple'],
  desktops: ['HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'MSI'],
  speakers: ['JBL', 'Sony', 'Bose', 'Logitech', 'Philips'],
  printers: ['HP', 'Canon', 'Epson', 'Brother'],
  solar: ['Luminous', 'Loom Solar', 'Microtek', 'V-Guard'],
  cctv: ['CP Plus', 'Godrej', 'Hikvision', 'Essence'],
  accessories: ['Logitech', 'Dell', 'HP', 'Lenovo', 'Samsung'],
}
