"""
A tiny local web service only for receiving post data from userscript.
"""

import os
import sqlite3
from flask import Flask, request

_DB_NAME = 'data.sqlite'
_HOST = '127.0.0.1'
_PORT = 5555

app = Flask(__name__)

@app.route('/')
def nothing_is_here():
   return 'nothing'

@app.route('/data', methods=['POST'])
def data():
    try:
        time = request.form['time']
        sender = request.form['sender']
        last_mesg = request.form['last_mesg']
        print('Received data: {}|{}|{}'.format(time, sender, last_mesg))
        with sqlite3.connect(_DB_NAME) as con:
            cur = con.cursor()
            cur.execute(
                """
                INSERT INTO inbox_data (time, sender, last_mesg) 
                VALUES (?,?,?)
                """,
                (time, sender, last_mesg))
            con.commit()
            msg = 'Record successfully added.'
    except:
        con.rollback()
        msg = 'Error occurred in insert operation.'
    finally:
        print(msg)
        con.close()
        return ''

def maybe_init_db():
    if not os.path.exists(_DB_NAME):
        conn = sqlite3.connect(_DB_NAME)
        print('Successfully connect to newly created database file.')
        conn.execute('CREATE TABLE inbox_data (time TEXT, sender TEXT, last_mesg TEXT)')
        print('Successfully created destined table.')
        conn.close()

if __name__ == '__main__':
    maybe_init_db()
    app.run(host=_HOST, port=_PORT)
