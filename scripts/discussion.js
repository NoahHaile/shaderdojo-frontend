
function copyToClipboard(text) {
    // Use the Clipboard API to copy the text
    navigator.clipboard.writeText(text)
        .then(() => {

        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text. Please try again.');
        });

}

function copyButtonClicked(button) {
    button.innerHTML = 'Copied!';
    setTimeout(() => {
        button.innerHTML = 'Copy Code';
    }, 1000);
}


async function fetchComments() {
    try {
        const response = await fetch(`http://localhost:7090/comments/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`${response.status}`);
        }

        const comments = await response.json();
        const commentsContainer = document.getElementById('comments');
        commentsContainer.innerHTML = '';
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');
            commentElement.innerHTML = `
                <div class="comment-header">
                    <p class="comment-user">${comment.account.username}</span>
                    <button type="button" class="copy-button" onclick="buttonClick(this); copyToClipboard('${comment.code}'); copyButtonClicked(this);">Copy Code</button>
                </div>
                <p class="comment-text">${comment.content}</p>
                </div>
            `;
            commentsContainer.appendChild(commentElement);
        });
        if (comments.length == 0) {
            commentsContainer.innerHTML = '<p>No comments yet.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching comments.');
    }
}

async function postComment(event) {
    event.preventDefault();
    const content = document.getElementById('content-post').value;
    const code = document.getElementById('code-post').value;
    try {
        const response = await fetch(`http://localhost:7090/account/comment/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ code, content }),
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        fetchComments();
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while posting your comment.');
    }
    return false;
}

fetchComments();