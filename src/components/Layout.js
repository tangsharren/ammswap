import React from 'react';
import Header from './Header/Header.js';

export default function Layout({ children }) {
    return (
        <div>
            <Header/>
            <div className="body">
                <main>{children}</main>
            </div>
        </div>
    );
}
