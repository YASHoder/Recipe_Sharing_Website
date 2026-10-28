import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

AWS.config.update({
  region: 'ap-southeast-2',
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'Recipe_Table'; 

export const insertData = async (name, message) => {
  const params = {
    TableName: Recipe_Table,
    Item: {
      id: uuidv4(),
      name: name,
      message: message,
    },
  };

  try {
    await dynamodb.put(params).promise();
    return { success: true, message: 'Data inserted successfully' };
  } catch (error) {
    console.error('Error inserting data:', error);
    return { success: false, error: error.message };
  }
};

export const fetchData = async () => {
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const data = await dynamodb.scan(params).promise();
    return { success: true, items: data.Items };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { success: false, error: error.message };
  }
};