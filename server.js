// server.js (Corrected for Deployment)
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

console.log("--- App is starting with these credentials ---");
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_SERVER:", process.env.DB_SERVER);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("DB_PASSWORD length:", process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : "Not set");
console.log("-------------------------------------------");
// --- END OF DEBUGGING BLOCK ---

// Keep the connection pool promise to be used in routes
const dbConnection = sql.connect(dbConfig)
    .then(pool => {
        console.log('Connected to Azure SQL Database!');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed! Bad Config: ', err);
        process.exit(1); // Exit the process if DB connection fails
    });

// --- API ROUTES ---
// GET all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const pool = await dbConnection;
        const result = await pool.request().query('SELECT * FROM Tasks');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// POST a new task
app.post('/api/tasks', async (req, res) => {
    const { task, dueDate, remarks, status, priority } = req.body;
    if (!task) return res.status(400).send('Task content cannot be empty');
    try {
        const pool = await dbConnection;
        const result = await pool.request()
            .input('taskParam', sql.NVarChar, task)
            .input('dueDateParam', sql.DateTime, dueDate ? new Date(dueDate) : null)
            .input('remarksParam', sql.NVarChar, remarks || null)
            .input('statusParam', sql.NVarChar, status || 'To Do')
            .input('priorityParam', sql.NVarChar, priority || 'Medium')
            .query(`INSERT INTO Tasks (task, dueDate, remarks, status, priority, createdAt) 
                    OUTPUT INSERTED.* VALUES (@taskParam, @dueDateParam, @remarksParam, @statusParam, @priorityParam, GETDATE())`);
        res.status(201).json(result.recordset[0]);
    } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// PUT (update) a task
app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { task, dueDate, remarks, status, priority } = req.body;
    if (!task) return res.status(400).send('Task content cannot be empty');
    try {
        const pool = await dbConnection;
        await pool.request()
            .input('idParam', sql.Int, id)
            .input('taskParam', sql.NVarChar, task)
            .input('dueDateParam', sql.DateTime, dueDate ? new Date(dueDate) : null)
            .input('remarksParam', sql.NVarChar, remarks || null)
            .input('statusParam', sql.NVarChar, status)
            .input('priorityParam', sql.NVarChar, priority)
            .query(`UPDATE Tasks SET task=@taskParam, dueDate=@dueDateParam, remarks=@remarksParam, status=@statusParam, priority=@priorityParam WHERE id = @idParam`);
        res.status(200).send({ message: 'Task updated' });
    } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// DELETE a task
app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await dbConnection;
        await pool.request()
            .input('idParam', sql.Int, id)
            .query('DELETE FROM Tasks WHERE id = @idParam');
        res.status(200).send({ message: 'Task deleted' });
    } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// --- CATCH-ALL ROUTE for frontend ---
// This should be the last route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
