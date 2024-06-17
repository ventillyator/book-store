import React from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';


export default function BuyOrRent({ bookId }) {
    const user = useSelector(state =>(state.user))
    const handlePurchase = async () => {
        try {
            await axios.post('http://localhost:4444/purchase', { userId: user.user._id, bookId });
            alert('Книга успешно куплена');
        } catch (error) {
            console.error('Ошибка при покупке книги:', error);
        }
    };

    const handleRent = async (rentalPeriod) => {
        try {
            await axios.post('http://localhost:4444/rent', { userId: user.user._id, bookId, rentalPeriod });
            alert(`Книга арендована на ${rentalPeriod} дней`);
        } catch (error) {
            console.error('Ошибка при аренде книги:', error);
        }
    };
    console.log( user);
    return (
        <div className="buy-or-rent">
            <button onClick={handlePurchase}>Купить</button>
            <button onClick={() => handleRent(14)}>Арендовать на 2 недели</button>
            <button onClick={() => handleRent(30)}>Арендовать на 1 месяц</button>
            <button onClick={() => handleRent(90)}>Арендовать на 3 месяца</button>
        </div>
    );
}
