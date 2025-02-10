import boto3
import csv
import json
import os

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb', region_name=os.getenv("REGION", "eu-north-1"))
    table_name = os.getenv("TABLE_NAME", "LinkedinProfiles")  # Use environment variable
    table = dynamodb.Table(table_name)

    response = table.scan()
    profiles = response.get('Items', [])

    csv_data = "Name,Job Role,Experience,OpenToWork\n"
    for profile in profiles:
        if profile.get("openToWork"):  # Use .get() to avoid KeyError
            csv_data += f"{profile['name']},{profile['jobRole']},{profile['experience']},{profile['openToWork']}\n"

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "table/csv",
            "Content-Disposition": "attachment; filename=open_to_work_profiles.csv"
        },
        "body": csv_data
    }
