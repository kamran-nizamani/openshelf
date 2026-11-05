import { Book, Category } from './types';

export const categories: Category[] = [
  { id: 'technology', name: 'Technology', description: 'Software, hardware, and digital innovation', featured: true },
  { id: 'ai', name: 'Artificial Intelligence', description: 'Machine intelligence, ethics, and practical applications', featured: true },
  { id: 'ml', name: 'Machine Learning', description: 'Algorithms, models, and predictive systems', featured: true },
  { id: 'cs', name: 'Computer Science', description: 'Core theory and systems design', featured: true },
  { id: 'programming', name: 'Programming', description: 'Applied coding skills and software craft', featured: true },
  { id: 'science', name: 'Science', description: 'Research, experiments, and scientific literacy', featured: true },
  { id: 'math', name: 'Mathematics', description: 'Logic, reasoning, and quantitative methods', featured: true },
  { id: 'business', name: 'Business', description: 'Operations, leadership, and strategy', featured: true },
  { id: 'entrepreneurship', name: 'Entrepreneurship', description: 'Startup strategy and business building', featured: true },
  { id: 'education', name: 'Education', description: 'Learning theory and instruction', featured: true },
  { id: 'history', name: 'History', description: 'Civilizations, change, and legacy', featured: true },
  { id: 'literature', name: 'Literature', description: 'Stories, voices, and cultural memory', featured: true },
  { id: 'novels', name: 'Novels', description: 'Long-form fiction and imaginative worlds', featured: true },
  { id: 'psychology', name: 'Psychology', description: 'Mind, behavior, and human flourishing', featured: true },
  { id: 'engineering', name: 'Engineering', description: 'Structures, systems, and design', featured: true },
  { id: 'self-development', name: 'Self Development', description: 'Growth, habits, and personal mastery', featured: true },
];

export const books: Book[] = [
  {
    id: '1',
    slug: 'deep-learning-with-python',
    title: 'Deep Learning with Python',
    author: 'Aisha Rahman',
    description: 'A practical guide to designing, training, and deploying neural networks for real-world tasks.',
    category: 'Machine Learning',
    language: 'English',
    publicationYear: 2024,
    isbn: '978-1-234567-89-0',
    publisher: 'OpenShelf Press',
    coverUrl:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
    fileFormat: 'PDF',
    licenseType: 'Creative Commons',
    licenseEvidence: 'CC BY-SA 4.0',
    rightsConfirmed: true,
    status: 'approved',
    uploaderId: 'u-001',
    featured: true,
    createdAt: '2024-11-01',
    tags: ['neural networks', 'python', 'machine learning'],
  },
  {
    id: '2',
    slug: 'clean-code-for-teamcraft',
    title: 'Clean Code for Teamcraft',
    author: 'Noah Patel',
    description: 'A readable guide to crafting maintainable software systems and building healthy engineering teams.',
    category: 'Programming',
    language: 'English',
    publicationYear: 2023,
    isbn: '978-0-765432-10-1',
    publisher: 'Northwind Education',
    coverUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    fileFormat: 'PDF',
    licenseType: 'Author-owned',
    licenseEvidence: 'Original manuscript by author',
    rightsConfirmed: true,
    status: 'approved',
    uploaderId: 'u-002',
    featured: true,
    createdAt: '2024-10-12',
    tags: ['clean code', 'engineering'],
  },
  {
    id: '3',
    slug: 'introduction-to-quantum-computing',
    title: 'Introduction to Quantum Computing',
    author: 'Sara Chen',
    description: 'An accessible introduction to quantum concepts, algorithms, and future implications for computing.',
    category: 'Computer Science',
    language: 'English',
    publicationYear: 2024,
    isbn: '978-9-876543-12-4',
    publisher: 'OpenShelf Research',
    coverUrl:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80',
    fileFormat: 'PDF',
    licenseType: 'Public Domain',
    licenseEvidence: 'Public-domain edition',
    rightsConfirmed: true,
    status: 'approved',
    uploaderId: 'u-003',
    featured: true,
    createdAt: '2024-09-21',
    tags: ['quantum', 'computing', 'science'],
  },
  {
    id: '4',
    slug: 'building-a-sustainable-business',
    title: 'Building a Sustainable Business',
    author: 'Daniel Romero',
    description: 'How founders can create resilient, values-driven businesses with a long-term perspective.',
    category: 'Business',
    language: 'English',
    publicationYear: 2022,
    isbn: '978-1-998877-55-3',
    publisher: 'Northwind Education',
    coverUrl:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
    fileFormat: 'PDF',
    licenseType: 'Creative Commons',
    licenseEvidence: 'CC BY 4.0',
    rightsConfirmed: true,
    status: 'approved',
    uploaderId: 'u-004',
    featured: false,
    createdAt: '2024-08-15',
    tags: ['business', 'leadership'],
  },
  {
    id: '5',
    slug: 'reading-the-human-brain',
    title: 'Reading the Human Brain',
    author: 'Maya Ali',
    description: 'A compelling overview of neuropsychology and how human cognition shapes learning and behavior.',
    category: 'Psychology',
    language: 'English',
    publicationYear: 2021,
    isbn: '978-1-332211-76-8',
    publisher: 'Mindstream Books',
    coverUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    fileFormat: 'PDF',
    licenseType: 'Author-owned',
    licenseEvidence: 'Author-supplied permission',
    rightsConfirmed: true,
    status: 'approved',
    uploaderId: 'u-005',
    featured: false,
    createdAt: '2024-07-17',
    tags: ['psychology', 'cognition'],
  },
  {
    id: '6',
    slug: 'engineering-for-everyday-life',
    title: 'Engineering for Everyday Life',
    author: 'Leo Wilson',
    description: 'A clear view of how engineering systems shape the technologies we depend on every single day.',
    category: 'Engineering',
    language: 'English',
    publicationYear: 2024,
    isbn: '978-0-112233-45-6',
    publisher: 'BuildLab Press',
    coverUrl:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
    fileFormat: 'PDF',
    licenseType: 'Creative Commons',
    licenseEvidence: 'CC BY-NC 4.0',
    rightsConfirmed: true,
    status: 'approved',
    uploaderId: 'u-006',
    featured: false,
    createdAt: '2024-06-09',
    tags: ['engineering', 'systems'],
  },
];

export function getBookBySlug(slug: string) {
  return books.find((book) => book.slug === slug) ?? books[0];
}

export function getFeaturedBooks() {
  return books.filter((book) => book.featured).slice(0, 4);
}

export function getMoreBooks() {
  return books.filter((book) => !book.featured);
}

export function getRecentBooks() {
  return [...books].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
}
