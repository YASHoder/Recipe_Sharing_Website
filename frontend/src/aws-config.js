import AWS from 'aws-sdk';

AWS.config.update({
  region: 'ap-southeast-2',
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default dynamodb;