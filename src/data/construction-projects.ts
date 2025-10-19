import { ConstructionProject } from '../types';

export const constructionProjects: ConstructionProject[] = [
  {
    id: '1',
    title: 'Bujumbura Heights Residential Complex',
    description: 'A modern 50-unit residential complex featuring contemporary architecture, green spaces, and premium amenities. This project showcases our expertise in large-scale residential development.',
    category: 'residential',
    images: [
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    completionDate: '2023-08-15',
    location: 'Rohero, Bujumbura',
    clientTestimonial: 'BUECC delivered exceptional quality and finished ahead of schedule. Their attention to detail and professional management made the entire process seamless.',
    services: ['Architectural Design', 'Civil Engineering', 'Project Management', 'Interior Design']
  },
  {
    id: '2',
    title: 'Central Bank Headquarters Renovation',
    description: 'Complete renovation and modernization of the Central Bank headquarters building, including structural upgrades, modern office spaces, and state-of-the-art security systems.',
    category: 'commercial',
    images: [
      'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    completionDate: '2023-12-20',
    location: 'Centre Ville, Bujumbura',
    clientTestimonial: 'The team at BUECC transformed our outdated building into a modern, efficient workspace while preserving its historical character.',
    services: ['Structural Engineering', 'Renovation', 'MEP Systems', 'Security Integration']
  },
  {
    id: '3',
    title: 'Kiriri Shopping Center',
    description: 'A modern retail complex featuring 25 shops, restaurants, and entertainment facilities. The project includes innovative design elements and sustainable building practices.',
    category: 'commercial',
    images: [
      'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/221540/pexels-photo-221540.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    completionDate: '2023-06-30',
    location: 'Kiriri, Bujumbura',
    services: ['Commercial Architecture', 'Site Development', 'Infrastructure', 'Landscaping']
  },
  {
    id: '4',
    title: 'Lake Tanganyika Resort',
    description: 'Luxury lakeside resort with 30 guest rooms, restaurant, conference facilities, and recreational amenities. Features sustainable design and local materials.',
    category: 'commercial',
    images: [
      'https://images.pexels.com/photos/2581922/pexels-photo-2581922.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    completionDate: '2023-10-12',
    location: 'Lake Tanganyika Shore',
    clientTestimonial: 'BUECC created a world-class resort that perfectly balances luxury with environmental responsibility. Our guests are amazed by the quality.',
    services: ['Resort Design', 'Hospitality Architecture', 'Landscape Architecture', 'Environmental Planning']
  }
];