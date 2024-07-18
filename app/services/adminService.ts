import { doc, setDoc, getDoc, updateDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

export const setProductPrices = async (prices: { productId: string, price: number }[]): Promise<void> => {
  const batch = writeBatch(db);

  prices.forEach(({ productId, price }) => {
    const priceDocRef = doc(db, 'prices', productId);
    batch.set(priceDocRef, { price });
  });

  try {
    await batch.commit();
    console.log('Product prices updated in Firestore');
  } catch (error) {
    console.error('Error updating product prices: ', error);
  }
};

export const getProductPrices = async (): Promise<{ productId: string, price: number }[] | null> => {
  try {
    const pricesSnapshot = await getDocs(collection(db, 'prices'));
    const prices: { productId: string, price: number }[] = [];

    pricesSnapshot.forEach((doc) => {
      prices.push({ productId: doc.id, price: doc.data().price });
    });

    return prices;
  } catch (error) {
    console.error('Error fetching product prices: ', error);
    return null;
  }
};
