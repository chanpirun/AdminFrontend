export type UserRole = "member" | "assistant" | "director";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedDate: string;
  initials: string;
};

export const users: User[] = [
  {
    id: "1",
    name: "Mario Mario",
    email: "mario@paragoniu.edu.kh",
    role: "member",
    joinedDate: "Jan 10, 2026",
    initials: "MM",
  },
  {
    id: "2",
    name: "Alex Chen",
    email: "alex.chen@paragoniu.edu.kh",
    role: "assistant",
    joinedDate: "Feb 3, 2026",
    initials: "AC",
  },
  {
    id: "3",
    name: "Sarah Kim",
    email: "sarah.kim@paragoniu.edu.kh",
    role: "member",
    joinedDate: "Feb 14, 2026",
    initials: "SK",
  },
  {
    id: "4",
    name: "Daniel Torres",
    email: "daniel.torres@paragoniu.edu.kh",
    role: "assistant",
    joinedDate: "Mar 1, 2026",
    initials: "DT",
  },
  {
    id: "5",
    name: "Mei Ling",
    email: "mei.ling@paragoniu.edu.kh",
    role: "member",
    joinedDate: "Mar 20, 2026",
    initials: "ML",
  },
  {
    id: "6",
    name: "James Nguyen",
    email: "james.nguyen@paragoniu.edu.kh",
    role: "member",
    joinedDate: "Apr 5, 2026",
    initials: "JN",
  },
  {
    id: "7",
    name: "Priya Sharma",
    email: "priya.sharma@paragoniu.edu.kh",
    role: "member",
    joinedDate: "Apr 12, 2026",
    initials: "PS",
  },
];
