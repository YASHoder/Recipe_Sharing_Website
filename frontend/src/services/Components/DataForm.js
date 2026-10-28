import React, { useState, useEffect } from 'react';
import { insertData, fetchData } from '../services/dyn-service';
import './data-form.css';

const DataForm = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [dataList, setDataList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    const result = await fetchData();
    if (result.success) {
      setDataList(result.items);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await insertData(name, message);
    if (result.success) {
      alert('Data inserted successfully');
      setName('');
      setMessage('');
      loadData();
    } else {
      alert('Failed to insert data');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Enter your name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <textarea 
          placeholder="Enter your message" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          required 
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      <div className="data-list">
        <h3>Submissions</h3>
        {dataList.map((item, index) => (
          <div key={index} className="data-item">
            <strong>{item.name}</strong>: {item.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataForm;