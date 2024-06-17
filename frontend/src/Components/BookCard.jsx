import React, { useState } from 'react';
import BuyOrRent from './Buy/BuyOrRent';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './EventCard.css';

export default function BookCard({ book }) {
    const isLoggedIn = useSelector(state => state.isLoggin);
    const [isEditing, setIsEditing] = useState(false);
    const [editedBook, setEditedBook] = useState({ ...book });
    const user = useSelector(state=>state.user)
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedBook({ ...editedBook, [name]: value });
    };

    const handleSave = async () => {
        try {
            await axios.put(`http://localhost:4444/books/${book._id}`, editedBook);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating book:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:4444/books/${book._id}`);
        } catch (error) {
            console.error('Error deleting book:', error);
        }
    };
    const adnim = true
    return (
        <div className="book-container">
            <div className="book-card">
                {isEditing ? (
                    <>
                        <input type="text" name="title" value={editedBook.title} onChange={handleInputChange} />
                        <textarea name="description" value={editedBook.description} onChange={handleInputChange} />
                        <input type="number" name="creation" value={editedBook.creation} onChange={handleInputChange} />
                        <input type="text" name="author" value={editedBook.author} onChange={handleInputChange} />
                        <input type="text" name="category" value={editedBook.category} onChange={handleInputChange} />
                        <input type="number" name="price" value={editedBook.price} onChange={handleInputChange} />
                        <button onClick={handleSave}>Сохранить</button>
                        <button onClick={handleEditToggle}>Отмена</button>
                    </>
                ) : (
                    <>
                        <h2>{book.title}</h2>
                        <img src={book.image} alt={book.title} className='img' />
                        <p>{book.description}</p>
                        <p>Год создания: {book.creation}</p>
                        <p>Автор: {book.author}</p>
                        <p>Категория: {book.category}</p>
                        <p>Цена: {book.price} рублей</p>
                        {isLoggedIn.isLoggin ? <BuyOrRent bookId={book._id} /> : ''}
                        {isLoggedIn.isLoggin  && user.user.email =="admin@admin.ru" && (
                            <>
                                <button onClick={handleEditToggle}>Редактировать</button>
                                <button onClick={handleDelete}>Удалить</button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
