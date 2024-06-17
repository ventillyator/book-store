import express from "express";
import cors from 'cors';
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


mongoose.connect('mongodb+srv://admin:wwwwww@cluster0.weppimj.mongodb.net/bookstore?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('DB okey'))
    .catch((err) => console.log('db error', err));

const app = express();

app.use(express.json());
app.use(cors());

// Модели
const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    surname: String,
    phone: String,
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }]
});
const User = mongoose.model('User', UserSchema);

const BookSchema = new mongoose.Schema({
    title: String,
    description: String,
    creation: Number,
    author: String,
    category: String,
    image: String,
    price: Number,
    isAvailable: { type: Boolean, default: true },
});
const Book = mongoose.model('Book', BookSchema);

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    type: String,
    rentalPeriod: Number,
    startDate: Date,
    endDate: Date,
    transactionDate: { type: Date, default: Date.now },
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

// Регистрация пользователя
app.post('/register', async(req, res) => {
    const { email, password, name, surname, phone } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: 'User with this email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, name, surname, phone });
        await user.save();
        const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
        res.status(201).send({ message: 'User created successfully', token, user });
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Авторизация пользователя
app.post('/login', async(req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
        res.send({ token, user });
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Создание книги
app.post('/books', async(req, res) => {
    const { title, description, creation, author, category, image } = req.body;
    const book = new Book({ title, description, creation, author, category, image });
    try {
        await book.save();
        res.status(201).send({ message: 'Book created successfully' });
    } catch (err) {
        res.status(400).send({ message: 'Error creating book' });
    }
});

// Получение списка книг
app.get('/books', async(req, res) => {
    try {
        const books = await Book.find();
        res.send(books);
    } catch (err) {
        res.status(500).send({ message: 'Error fetching books' });
    }
});

// Покупка книги
app.post('/purchase', async (req, res) => {
    const { userId, bookId } = req.body;
    try {
        const book = await Book.findById(bookId);
        if (!book || !book.isAvailable) {
            return res.status(400).send({ message: 'Book is not available for purchase' });
        }

        const transaction = new Transaction({ userId, bookId, type: 'purchase' });
        await transaction.save();

        book.isAvailable = false;
        await book.save();

        await User.findByIdAndUpdate(userId, { $push: { transactions: transaction._id } });

        res.status(201).send({ message: 'Book purchased successfully', transaction });
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Аренда книги
app.post('/rent', async (req, res) => {
    const { userId, bookId, rentalPeriod } = req.body;
    try {
        const book = await Book.findById(bookId);
        if (!book || !book.isAvailable) {
            return res.status(400).send({ message: 'Book is not available for rent' });
        }

        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + rentalPeriod * 24 * 60 * 60 * 1000);

        const transaction = new Transaction({ userId, bookId, type: 'rental', rentalPeriod, startDate, endDate });
        await transaction.save();

        await User.findByIdAndUpdate(userId, { $push: { transactions: transaction._id } });

        res.status(201).send({ message: 'Book rented successfully', transaction });
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Получение транзакций пользователя
app.get('/transactions/:userId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.params.userId })
        res.status(200).send(transactions);
    } catch (error) {
        res.status(500).send({ message: 'Ошибка при получении транзакций', error });
    }
});
app.get('/transactions/:id', async (req, res) => {
    try {
        const id = req.params
        const transactions = await Transaction.findById(id)
        res.status(200).send(transactions);
    } catch (error) {
        res.status(500).send({ message: 'Ошибка при получении транзакций', error });
    }
});

app.get('/transactions' , async(req , res )=>{
    try {
        const transactions = await Transaction.find()
        res.send(transactions)
    } catch (e) {
        res.status(500).send({ message: 'Ошибка при получении транзакций', error });
    }
})

app.get('/book/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const book = await Book.findById(id);
        res.status(200).send(book);
    } catch (error) {
        res.status(500).send({ message: 'Ошибка при получении информации о книге', error });
    }
});
app.delete('/books/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const book = await Book.findByIdAndDelete(id);
        res.status(200).send(book);
    } catch (error) {
        res.status(500).send({ message: 'Ошибка при получении информации о книге', error });
    }
});
app.listen(4444, () => {
    console.log('Сервер запущен');
});
