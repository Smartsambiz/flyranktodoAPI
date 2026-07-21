const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'tasks.db'));

db.exec(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0
)`);

const rowCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
if (rowCount.count === 0) {
  db.exec(`INSERT INTO tasks (title, done) VALUES
    ('Learn Express', 1),
    ('Build Task API', 0),
    ('Deploy', 0)`);
}

const origPrepare = db.prepare.bind(db);
db.prepare = function (sql) {
  const stmt = origPrepare(sql);

  const origRun = stmt.run.bind(stmt);
  stmt.run = function (...params) {
    params = params.map(p => typeof p === 'boolean' ? Number(p) : p);
    return origRun(...params);
  };

  const origGet = stmt.get.bind(stmt);
  stmt.get = function (...params) {
    const row = origGet(...params);
    if (row && row.done !== undefined) row.done = Boolean(row.done);
    return row;
  };

  const origAll = stmt.all.bind(stmt);
  stmt.all = function (...params) {
    const rows = origAll(...params);
    return rows.map(r => {
      if (r && r.done !== undefined) r.done = Boolean(r.done);
      return r;
    });
  };

  return stmt;
};

module.exports = db;
