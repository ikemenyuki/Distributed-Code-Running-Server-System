package utils

import (
	"fmt"
	"io"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

// uploadToS3 uploads a file to an S3 bucket
// Parameters: bucket name, object key, and file path
func UploadToS3(bucket, key, filePath string) error {
	sess, err := session.NewSession(&aws.Config{
		Region:      aws.String(AwsRegion),
	})
	if err != nil {
		return fmt.Errorf("failed to create session: %v", err)
	}

	uploader := s3.New(sess)

	f, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("failed to open file %s: %v", filePath, err)
	}
	defer f.Close()

	_, err = uploader.PutObject(&s3.PutObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
		Body:   f,
	})
	if err != nil {
		return fmt.Errorf("failed to upload file %s: %v", filePath, err)
	}

	fmt.Printf("Successfully uploaded %s to %s/%s\n", filePath, bucket, key)
	return nil
}

// downloadFromS3 downloads a file from an S3 bucket
// Parameters: bucket name, object key, and destination file path
func DownloadFromS3(bucket, key, destPath string) error {
	sess, err := session.NewSession(&aws.Config{
		Region:      aws.String(AwsRegion),
	})
	if err != nil {
		return fmt.Errorf("failed to create session: %v", err)
	}

	downloader := s3.New(sess)

	f, err := os.Create(destPath)
	if err != nil {
		return fmt.Errorf("failed to create file %s: %v", destPath, err)
	}
	defer f.Close()

	resp, err := downloader.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("failed to download file: %v", err)
	}
	defer resp.Body.Close()

	// Write the contents of the S3 object to the file
	if _, err := io.Copy(f, resp.Body); err != nil {
		return fmt.Errorf("failed to copy object to file: %v", err)
	}

	fmt.Printf("Successfully downloaded %s to %s\n", key, destPath)
	return nil
}
