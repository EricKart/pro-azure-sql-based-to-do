// server.js
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const path = require('path'); // <-- Add this line

const app = express();
app.use(express.json());
app.use(cors());

// --- NEW: Serve static files from the 'public' directory ---
app.use(express.static(path.join(__dirname, 'public')));


// --- IMPORTANT: Use Environment Variables for credentials in production ---
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


sql.connect(dbConfig).then(pool => {
    console.log('Connected to Azure SQL Database!');
}).catch(err => {
    console.error('Database Connection Failed! Bad Config: ', err);
});

// --- API Routes ---

// GET all tasks
app.get('/tasks', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM Tasks');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while fetching tasks');
    }
});

// POST a new task
app.post('/tasks', async (req, res) => {
    const { task, dueDate, remarks, status, priority } = req.body;
    if (!task) {
        return res.status(400).send('Task content cannot be empty');
    }

    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('taskParam', sql.NVarChar, task)
            .input('dueDateParam', sql.DateTime, dueDate ? new Date(dueDate) : null)
            .input('remarksParam', sql.NVarChar, remarks || null)
            .input('statusParam', sql.NVarChar, status || 'To Do')
            .input('priorityParam', sql.NVarChar, priority || 'Medium')
            .query(`INSERT INTO Tasks (task, dueDate, remarks, status, priority, createdAt) 
                    OUTPUT INSERTED.* VALUES (@taskParam, @dueDateParam, @remarksParam, @statusParam, @priorityParam, GETDATE())`);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while adding a task');
    }
});

// PUT (update) a task
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { task, dueDate, remarks, status, priority } = req.body;

    if (!task) {
        return res.status(400).send('Task content cannot be empty');
    }

    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('idParam', sql.Int, id)
            .input('taskParam', sql.NVarChar, task)
            .input('dueDateParam', sql.DateTime, dueDate ? new Date(dueDate) : null)
            .input('remarksParam', sql.NVarChar, remarks || null)
            .input('statusParam', sql.NVarChar, status)
            .input('priorityParam', sql.NVarChar, priority)
            .query(`UPDATE Tasks 
                    SET task = @taskParam, 
                        dueDate = @dueDateParam, 
                        remarks = @remarksParam, 
                        status = @statusParam,
                        priority = @priorityParam
                    WHERE id = @idParam`);
        res.status(200).send({ message: 'Task updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while updating the task');
    }
});

// DELETE a task
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('idParam', sql.Int, id)
            .query('DELETE FROM Tasks WHERE id = @idParam');
        res.status(200).send({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while deleting a task');
    }
});

// --- NEW: Catch-all route to serve the frontend ---
// This should be the last route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
