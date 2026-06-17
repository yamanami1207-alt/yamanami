export interface StoneType {
  id: string;
  name: string;
  color: string;
  prices: {
    8: number;
    10: number | null;
  };
  image: string;
}

export interface Bead {
  id: string;
  type: "empty" | "bead";
  name: string;
  size: number;
  price: number;
  color: string | null;
  image: string | null;
}
