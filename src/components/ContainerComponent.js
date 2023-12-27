import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import Header from './Header/Header.js';
import ProvideLiquidity from './ProvideComponent/ProvideComponent';
import WithdrawLiquidity from './WithdrawComponent/WithdrawComponent';
import './ContainerComponent.css';

export default function ProvideComponent() {
    return (
        <div style={{ background: "#F8F8F8" }}>
            <Header />

            <div className='d-block mx-auto w-75 p-5'>
                <Tabs>
                    <TabList className="text-center">
                        <Tab>Provide Liquidity</Tab>
                        <Tab>Withdraw Liquidity</Tab>
                    </TabList>

                    <TabPanel>
                        <div>
                            <ProvideLiquidity />
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div><WithdrawLiquidity /></div>
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    );
}
