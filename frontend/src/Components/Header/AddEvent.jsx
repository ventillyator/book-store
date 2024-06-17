import React, { useState } from 'react';
import axios from 'axios';
import './AddEvent.css';
import Modal from '../Modal';

const AddEvent = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [creation, setCreation] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:4444/books', {
                title,
                description,
                creation: parseInt(creation),
                author,
                category,
                price: parseFloat(price),
                image
            });
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error adding book:', error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div>
            <h2>Добавление книги</h2>
            <form className='event-form' onSubmit={handleSubmit}>
                <div>
                    <label>Заголовок:</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                    <label>Описание:</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div>
                    <label>Год создания:</label>
                    <input type="number" value={creation} onChange={(e) => setCreation(e.target.value)} />
                </div>
                <div>
                    <label>Автор:</label>
                    <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
                </div>
                <div>
                    <label>Категория:</label>
                    <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
                <div>
                    <label>Цена:</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div>
                    <label>Фото:</label>
                    <input type="text" value={image} onChange={(e) => setImage(e.target.value)} />
                </div>
                <button className='btn' type="submit">Добавить</button>
            </form>
            <Modal isOpen={isModalOpen} closeModal={closeModal}>
                <p>Книга успешно добавлена!</p>
            </Modal>
        </div>
    );
};

export default AddEvent;
