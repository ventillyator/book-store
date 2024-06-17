import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './Dashboard.css';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const user = useSelector(state => state.user);
    const [userTransactions, setUserTransactions] = useState([]);
    const [transitions, setTransitions] = useState([]);
    const [books, setBooks] = useState({});

    useEffect(() => {
        axios.get('http://localhost:4444/transactions')
            .then(res => {
                setTransitions(res.data);
            })
            .catch(err => {
                console.error('Ошибка при загрузке транзакций:', err);
            });
    }, []);

    useEffect(() => {
        const userTrans = transitions.filter(transaction => transaction.userId === user.user._id);
        setUserTransactions(userTrans);

        const bookIds = userTrans.map(trans => trans.bookId);
        const uniqueBookIds = [...new Set(bookIds)];

        Promise.all(uniqueBookIds.map(bookId =>
            axios.get(`http://localhost:4444/book/${bookId}`)
                .then(res => ({ id: bookId, title: res.data.title }))
                .catch(err => {
                    console.error(`Ошибка при загрузке книги ${bookId}:`, err);
                    // return { id: bookId, title: 'Неизвестная книга' };
                })
        )).then(bookData => {
            const booksMap = bookData.reduce((acc, book) => {
                acc[book.id] = book.title;
                return acc;
            }, {});
            setBooks(booksMap);
        });
    }, [transitions, user.user._id]);

    return (
        <div className="dashboard-container">
            <div className="user-info">
                <h1>Личный кабинет пользователя: {user.user.name}</h1>
                <hr />
                <div className="user-details">
                    <p className="user-detail">Телефон: {user.user.phone}</p>
                    <p className="user-detail">Фамилия: {user.user.surname}</p>
                    <p className="user-detail">Email: {user.user.email}</p>
                    {user.user.email === 'admin@admin.ru' ? <Link to='/addEvent'>Добавить книгу</Link> : ''}
                </div>
            </div>

            <div className="transactions-container">
                <h2>Транзакции пользователя:</h2>
                {userTransactions.map(transaction => (
                    <div key={transaction._id} className="transaction">
                        {transaction.bookId && (
                            <React.Fragment>
                                <p className="book-title">Книга: {books[transaction.bookId] || 'Загрузка...'}</p>
                                <p className="transaction-type">Тип: {transaction.type === 'purchase' ? 'Покупка' : 'Аренда'}</p>
                                {transaction.type === 'rental' && (
                                    <>
                                        <p className="rental-period">Период аренды: {transaction.rentalPeriod} дней</p>
                                        <p className="start-date">Дата начала: {new Date(transaction.startDate).toLocaleDateString()}</p>
                                        <p className="end-date">Дата окончания: {new Date(transaction.endDate).toLocaleDateString()}</p>
                                    </>
                                )}
                                <hr />
                            </React.Fragment>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
