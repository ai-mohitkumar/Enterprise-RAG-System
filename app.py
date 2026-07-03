import os
from typing import Any

import requests
import streamlit as st
st.set_page_config(
    page_title="RAG Assistant",
    page_icon="📚",
    layout="wide",
)
from dotenv import load_dotenv

load_dotenv()


def get_secret(name: str, default: str = "") -> str:
    try:
        value = st.secrets.get(name)
        if value:
            return str(value)
    except Exception:
        pass
    return os.getenv(name, default)


API_BASE_URL = get_secret("BACKEND_API_URL", "http://127.0.0.1:8000").rstrip("/")
REQUEST_TIMEOUT = int(get_secret("BACKEND_TIMEOUT_SECONDS", "60"))


def api_url(path: str) -> str:
    return f"{API_BASE_URL}{path}"


def call_api(method: str, path: str, **kwargs: Any) -> requests.Response:
    response = requests.request(
        method=method,
        url=api_url(path),
        timeout=REQUEST_TIMEOUT,
        **kwargs,
    )
    response.raise_for_status()
    return response


def get_health() -> dict[str, Any]:
    return call_api("GET", "/health").json()


def get_documents() -> list[dict[str, Any]]:
    return call_api("GET", "/documents").json().get("documents", [])


def upload_documents(files: list[Any]) -> dict[str, Any]:
    if not files:
        return {"results": []}

    if len(files) == 1:
        file = files[0]
        response = call_api(
            "POST",
            "/documents/upload",
            files={"file": (file.name, file.getvalue(), file.type or "application/octet-stream")},
        ).json()
        return {"results": [response]}

    payload = [
        ("files", (file.name, file.getvalue(), file.type or "application/octet-stream"))
        for file in files
    ]
    return call_api("POST", "/documents/upload-batch", files=payload).json()


def delete_document(document_id: str) -> None:
    call_api("DELETE", f"/documents/{document_id}")


def run_query(query: str) -> dict[str, Any]:
    return call_api("POST", "/query", json={"query": query, "top_k": 5}).json()


def format_sources(sources: list[str]) -> str:
    if not sources:
        return "No sources returned."
    return "\n".join(f"- {source}" for source in sources)




if "messages" not in st.session_state:
    st.session_state.messages = []

if "documents" not in st.session_state:
    st.session_state.documents = []


st.title("📚 RAG Assistant")
st.caption("Streamlit frontend connected to a FastAPI backend deployed on Render.")

with st.sidebar:
    st.subheader("Deployment")
    st.write(f"Backend API: `{API_BASE_URL}`")

    if st.button("Check Backend Health", use_container_width=True):
        try:
            health = get_health()
            st.success(f"Backend is {health.get('status', 'healthy')}")
        except requests.RequestException as exc:
            st.error(f"Health check failed: {exc}")

    st.info(
        "For Streamlit Community Cloud, set `BACKEND_API_URL` in app secrets to your Render backend URL."
    )


chat_tab, documents_tab, system_tab = st.tabs(
    ["Chat", "Documents", "System"]
)

with chat_tab:

    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

# Outside the tabs
prompt = st.chat_input("Ask a question about your uploaded knowledge base...")

if prompt:
    
        st.session_state.messages.append({"role": "user", "content": prompt})

        with st.chat_message("user"):
            st.markdown(prompt)

        try:
            with st.chat_message("assistant"):
                with st.spinner("Thinking..."):
                    result = run_query(prompt)
                    st.markdown(result["response"])
                    if result.get("sources"):
                        with st.expander("Sources"):
                            st.markdown(format_sources(result["sources"]))

            st.session_state.messages.append(
                {
                    "role": "assistant",
                    "content": result["response"],
                    "sources": result.get("sources", []),
                }
            )
        except requests.RequestException as exc:
            st.error(f"Query failed: {exc}")
            st.session_state.messages.pop()

with documents_tab:
    st.subheader("Upload Documents")
    uploaded_files = st.file_uploader(
        "Upload PDF, DOCX, TXT, or MD files",
        type=["pdf", "docx", "txt", "md", "doc"],
        accept_multiple_files=True,
    )

    col1, col2 = st.columns([1, 1])
    with col1:
        if st.button("Upload Selected Files", use_container_width=True):
            if not uploaded_files:
                st.warning("Select at least one file first.")
            else:
                try:
                    result = upload_documents(uploaded_files)
                    uploaded_count = len(
                        [item for item in result.get("results", []) if item.get("status") == "uploaded"]
                    )
                    st.success(f"Uploaded {uploaded_count} file(s).")
                except requests.RequestException as exc:
                    st.error(f"Upload failed: {exc}")

    with col2:
        if st.button("Refresh Documents", use_container_width=True):
            try:
                st.session_state.documents = get_documents()
            except requests.RequestException as exc:
                st.error(f"Failed to load documents: {exc}")

    try:
        st.session_state.documents = get_documents()
    except requests.RequestException as exc:
        st.error(f"Failed to load documents: {exc}")

    st.subheader("Current Documents")
    if not st.session_state.documents:
        st.info("No documents found on the backend.")
    else:
        for doc in st.session_state.documents:
            cols = st.columns([5, 2, 2, 1])
            cols[0].write(f"**{doc['filename']}**")
            cols[1].write(doc.get("document_type", "unknown"))
            cols[2].write(doc.get("processing_status", "unknown"))
            if cols[3].button("Delete", key=f"delete-{doc['id']}"):
                try:
                    delete_document(doc["id"])
                    st.success(f"Deleted {doc['filename']}")
                    st.session_state.documents = get_documents()
                    st.rerun()
                except requests.RequestException as exc:
                    st.error(f"Delete failed: {exc}")

with system_tab:
    st.subheader("Backend Notes")
    st.markdown(
        """
        - Backend deployment target: Render web service.
        - Frontend deployment target: Streamlit Community Cloud.
        - On Render free web services, local uploaded files are not durable across spin-downs or redeploys.
        - For durable uploads, move the backend to a paid Render instance with persistent storage or external object storage.
        """
    )

    st.subheader("API Endpoints Used")
    st.code(
        "\n".join(
            [
                "GET /health",
                "GET /documents",
                "POST /documents/upload",
                "POST /documents/upload-batch",
                "DELETE /documents/{document_id}",
                "POST /query",
            ]
        ),
        language="text",
    )
