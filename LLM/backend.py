import os
import vertexai
from langchain_google_vertexai import VertexAI
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="./key.json" # place the key JSON file in the same folder as your notebook

PROJECT_ID = "august-craft-412319" # use your project id
REGION = "us-central1"  #
BUCKET_URI = f"gs://gen-ai-storage-bucket-xyd"  # create your own bucket

vertexai.init(project=PROJECT_ID, location=REGION, staging_bucket=BUCKET_URI)

llm = VertexAI(
    model_name="text-bison@001",
    max_output_tokens=256,
    temperature=0.5,
    top_p=0.8,
    top_k=40,
    verbose=True,
)

@app.route('/ask-LLM', methods=['POST'])
def process_input():
    data = request.json
    code = data['code']
    output = data['output']
    print(f"Received: {code}\n{output}")

    prompt_template = PromptTemplate(
        input_variables=['code','output'],
        template="Please help me to debug my code. The whole file structure and content in json format is {code}. \n The output or error I get by running above code is {output}. Please provide me the reason and solution."
    )
    debug_chain = LLMChain(llm=llm, prompt=prompt_template)    
    result = debug_chain.run(code=code,output=output)
    print(f"Result: {result}")    
    return jsonify({'ans': result})

@app.route('/chat', methods=['POST'])
def process_chat():
    data = request.json
    msg = data['message']
    code = data['code']

    print(f"Received: {code}\n{msg}")

    prompt_template = PromptTemplate(
        input_variables=['message'],
        template="You are a programmer and there is another programmer wants to talk with you. The programmer just wrote this code (with whole file structure and content in a json format): {code}. The programmer's message is {message}. Please reply to this programmer's message."
    )
    chat_chain = LLMChain(llm=llm, prompt=prompt_template)    
    result = chat_chain.run(code=code, message=msg)
    print(f"Result: {result}")    
    return jsonify({'ans': result})

if __name__ == '__main__':
    app.run(debug=True, port=5003)
