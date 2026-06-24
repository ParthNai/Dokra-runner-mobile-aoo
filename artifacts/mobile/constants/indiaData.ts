export interface City {
  name: string;
  club: string;
}

export interface State {
  name: string;
  cities: City[];
}

export const indiaStates: State[] = [
  {
    name: "Andhra Pradesh",
    cities: [
      { name: "Visakhapatnam", club: "DOKRA Visakhapatnam Running Club" },
      { name: "Vijayawada", club: "DOKRA Vijayawada Running Club" },
      { name: "Guntur", club: "DOKRA Guntur Running Club" },
      { name: "Tirupati", club: "DOKRA Tirupati Running Club" },
    ],
  },
  {
    name: "Delhi",
    cities: [
      { name: "New Delhi", club: "DOKRA New Delhi Running Club" },
      { name: "Dwarka", club: "DOKRA Dwarka Running Club" },
      { name: "Rohini", club: "DOKRA Rohini Running Club" },
      { name: "Lajpat Nagar", club: "DOKRA Lajpat Nagar Running Club" },
    ],
  },
  {
    name: "Gujarat",
    cities: [
      { name: "Ahmedabad", club: "DOKRA Ahmedabad Running Club" },
      { name: "Surat", club: "DOKRA Surat Running Club" },
      { name: "Vadodara", club: "DOKRA Vadodara Running Club" },
      { name: "Rajkot", club: "DOKRA Rajkot Running Club" },
      { name: "Gandhinagar", club: "DOKRA Gandhinagar Running Club" },
    ],
  },
  {
    name: "Haryana",
    cities: [
      { name: "Gurugram", club: "DOKRA Gurugram Running Club" },
      { name: "Faridabad", club: "DOKRA Faridabad Running Club" },
      { name: "Ambala", club: "DOKRA Ambala Running Club" },
      { name: "Panipat", club: "DOKRA Panipat Running Club" },
    ],
  },
  {
    name: "Karnataka",
    cities: [
      { name: "Bangalore", club: "DOKRA Bangalore Running Club" },
      { name: "Mysore", club: "DOKRA Mysore Running Club" },
      { name: "Hubli", club: "DOKRA Hubli Running Club" },
      { name: "Mangalore", club: "DOKRA Mangalore Running Club" },
    ],
  },
  {
    name: "Kerala",
    cities: [
      { name: "Kochi", club: "DOKRA Kochi Running Club" },
      { name: "Thiruvananthapuram", club: "DOKRA Thiruvananthapuram Running Club" },
      { name: "Kozhikode", club: "DOKRA Kozhikode Running Club" },
      { name: "Thrissur", club: "DOKRA Thrissur Running Club" },
    ],
  },
  {
    name: "Madhya Pradesh",
    cities: [
      { name: "Bhopal", club: "DOKRA Bhopal Running Club" },
      { name: "Indore", club: "DOKRA Indore Running Club" },
      { name: "Gwalior", club: "DOKRA Gwalior Running Club" },
      { name: "Jabalpur", club: "DOKRA Jabalpur Running Club" },
    ],
  },
  {
    name: "Maharashtra",
    cities: [
      { name: "Mumbai", club: "DOKRA Mumbai Running Club" },
      { name: "Pune", club: "DOKRA Pune Running Club" },
      { name: "Nagpur", club: "DOKRA Nagpur Running Club" },
      { name: "Nashik", club: "DOKRA Nashik Running Club" },
      { name: "Aurangabad", club: "DOKRA Aurangabad Running Club" },
      { name: "Thane", club: "DOKRA Thane Running Club" },
    ],
  },
  {
    name: "Punjab",
    cities: [
      { name: "Chandigarh", club: "DOKRA Chandigarh Running Club" },
      { name: "Ludhiana", club: "DOKRA Ludhiana Running Club" },
      { name: "Amritsar", club: "DOKRA Amritsar Running Club" },
      { name: "Jalandhar", club: "DOKRA Jalandhar Running Club" },
    ],
  },
  {
    name: "Rajasthan",
    cities: [
      { name: "Jaipur", club: "DOKRA Jaipur Running Club" },
      { name: "Jodhpur", club: "DOKRA Jodhpur Running Club" },
      { name: "Udaipur", club: "DOKRA Udaipur Running Club" },
      { name: "Kota", club: "DOKRA Kota Running Club" },
    ],
  },
  {
    name: "Tamil Nadu",
    cities: [
      { name: "Chennai", club: "DOKRA Chennai Running Club" },
      { name: "Coimbatore", club: "DOKRA Coimbatore Running Club" },
      { name: "Madurai", club: "DOKRA Madurai Running Club" },
      { name: "Salem", club: "DOKRA Salem Running Club" },
    ],
  },
  {
    name: "Telangana",
    cities: [
      { name: "Hyderabad", club: "DOKRA Hyderabad Running Club" },
      { name: "Warangal", club: "DOKRA Warangal Running Club" },
      { name: "Nizamabad", club: "DOKRA Nizamabad Running Club" },
    ],
  },
  {
    name: "Uttar Pradesh",
    cities: [
      { name: "Lucknow", club: "DOKRA Lucknow Running Club" },
      { name: "Agra", club: "DOKRA Agra Running Club" },
      { name: "Varanasi", club: "DOKRA Varanasi Running Club" },
      { name: "Kanpur", club: "DOKRA Kanpur Running Club" },
      { name: "Noida", club: "DOKRA Noida Running Club" },
      { name: "Meerut", club: "DOKRA Meerut Running Club" },
    ],
  },
  {
    name: "West Bengal",
    cities: [
      { name: "Kolkata", club: "DOKRA Kolkata Running Club" },
      { name: "Howrah", club: "DOKRA Howrah Running Club" },
      { name: "Durgapur", club: "DOKRA Durgapur Running Club" },
      { name: "Siliguri", club: "DOKRA Siliguri Running Club" },
    ],
  },
];

export function getCitiesForState(stateName: string): City[] {
  const state = indiaStates.find((s) => s.name === stateName);
  return state ? state.cities : [];
}

export function getClubForCity(stateName: string, cityName: string): string {
  const cities = getCitiesForState(stateName);
  const city = cities.find((c) => c.name === cityName);
  return city ? city.club : `DOKRA ${cityName} Running Club`;
}
