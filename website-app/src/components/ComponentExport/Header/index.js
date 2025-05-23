import React,{useState} from 'react'
const ExportHeader = ({content,onCreateOrder})=>{
    const {title,btn1,btn2} =content;
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="order-mgmt-header">
            <h2 className="order-mgmt-title">{title}</h2>
            <div className="order-mgmt-header-controls">
            <input
                type="text"
                className="order-mgmt-search"
                placeholder="Search for..."
                value={searchTerm}
                // onChange={handleSearch}
                />
                <button className="order-mgmt-create-btn" onClick={onCreateOrder}>{btn1}</button>
                <button className="order-mgmt-history-btn">{btn2}</button>
            </div>
        </div>
    );
};

export default ExportHeader;