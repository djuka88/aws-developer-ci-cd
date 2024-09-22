import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const REGION = "us-east-1";
const snsClient = new SNSClient({ region: REGION });

const topicArn = `arn:aws:sns:${REGION}:891377300907:milan-djukic-UploadsNotificationTopic`;

export const handler = async (event, context) => {
    console.log("Received SQS event:", JSON.stringify(event));

    const promises = event.Records.map(async record => {
        const messageBody = JSON.parse(record.body);
        console.log("Message body:", messageBody);

        // Extract file details
        const fileId = messageBody.id;
        const fileName = messageBody.name;
        const fileUrl = messageBody.url;
        const fileMetadata = messageBody.metadata;

        console.log(`File ID: ${fileId}, Name: ${fileName}, URL: ${fileUrl}, Metadata: ${fileMetadata}`);

        // Construct the message to send to SNS
        const snsMessage = {
            eventType: 'FileUpload',
            details: {
                id: fileId,
                name: fileName,
                url: fileUrl,
                metadata: fileMetadata,
                timestamp: new Date().toISOString()
            }
        };

        // Send the message to SNS
        const publishParams = {
            Message: JSON.stringify(snsMessage),
            TopicArn: topicArn
        };

        try {
            const data = await snsClient.send(new PublishCommand(publishParams));
            console.log("Message sent to the topic:", data);
        } catch (err) {
            console.error("Error publishing to SNS:", err);
            throw err;
        }
    });

    await Promise.all(promises);

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Process completed' })
    };
};