import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BookCard from './BookCard';
import { useSelector } from 'react-redux';
import './HomePage.css';

export default function HomePage() {
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');
    const isLoggedIn = useSelector(state => state.isLoggedIn);
    const user = useSelector(state => state.user);

    useEffect(() => {
        axios.get('http://localhost:4444/books')
            .then(res => setBooks(res.data))
            .catch(e => console.log(e));
    }, []);

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const sortBooks = (filteredBooks) => {
        switch (sortBy) {
            case 'category':
                return filteredBooks.sort((a, b) => a.category.localeCompare(b.category));
            case 'author':
                return filteredBooks.sort((a, b) => a.author.localeCompare(b.author));
            case 'creation':
                return filteredBooks.sort((a, b) => a.creation - b.creation);
            default:
                return filteredBooks;
        }
    };

    const sortedBooks = sortBooks(filteredBooks);

    return (
        <>
            <h1 className='home-title'>Наша Библиотека</h1>
            <div className="filters">
                <input
                    type="text"
                    placeholder="Поиск по заголовку"
                    value={searchTerm}
                    onChange={handleSearch}
                    className='search-input'
                />
                <select value={sortBy} onChange={handleSortChange} className="sort-select">
                    <option value="">Сортировать по...</option>
                    <option value="category">Категории</option>
                    <option value="author">Автору</option>
                    <option value="creation">Году написания</option>
                </select>
            </div>
            <div className="book-list">
                {sortedBooks.map((book, id) => (
                    <BookCard key={id} book={book}  />
                ))}
            </div>
        </>
    );
}
