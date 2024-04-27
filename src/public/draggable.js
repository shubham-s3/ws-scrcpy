window.addEventListener('load', function () {
    const draggableBox = document.getElementById('draggable-box');
    let offsetX, offsetY;
    let isDragging = false;

    draggableBox.addEventListener('mousedown', (event) => {
        isDragging = true;
        offsetX = event.clientX - draggableBox.getBoundingClientRect().left;
        offsetY = event.clientY - draggableBox.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', (event) => {
        if (isDragging) {
            const newX = event.clientX - offsetX;
            const newY = event.clientY - offsetY;
            draggableBox.style.left = `${newX}px`;
            draggableBox.style.top = `${newY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Tab handling
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    function handleClick(event) {
        // Remove active class from all tab buttons and tab contents
        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to the clicked tab button and corresponding tab content
        const tabId = event.target.id;
        document.getElementById(tabId).classList.add('active');
        document.getElementById(`tab-content${tabId.slice(-1)}`).classList.add('active');
    }

    tabButtons.forEach(button => button.addEventListener('click', handleClick));


    // Handle tabs functionality
    const timeLimitInMinutes = 30;

    const sendPingToServer = async () => {
        const response = await fetch('http://10.250.82.31:3000/admin/ping/');
        return { status: response.status }
    }

    const getAllUsersPing = async () => {
        const response = await fetch(`http://10.250.82.31:3000/admin/getactiveusers?timeLimitInMinutes=${timeLimitInMinutes}`);
        const data = await response.json();
        return { status: response.status, data }
    }

    const installApk = async () => {
        try {
            const bitriseBuildNumber = document.getElementById('apkIntallerInput').value;

            if (bitriseBuildNumber) {
                document.getElementById('apkIntallerInput-loader').style.display = 'block';
                document.getElementById('apkIntallerInput-submit').style.display = 'none';
                const response = await fetch(`http://10.250.82.31:3000/admin/installapk/${bitriseBuildNumber}`);

                document.getElementById('apkIntallerInput-responseText').innerHTML = `Response - ${response.statusText} (${response.status})`;
            }

            else {
                throw new Error("Check value of input")
            }
        }

        catch (e) {
            console.error("error: ", e);
            document.getElementById('apkIntallerInput-responseText').innerHTML = e;
        }

        document.getElementById('apkIntallerInput-loader').style.display = 'none';
        document.getElementById('apkIntallerInput-submit').style.display = 'block';
    }
    this.document.getElementById('apkIntallerInput-submit').onclick = installApk;

    const isTabFocused = () => {
        return !document.hidden;
    }

    const updateList = (items) => {
        const ul = document.getElementById('lastActiveUser');
        ul.innerHTML = '';

        items.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('lastActiveUser_li');
            li.textContent = item;
            ul.appendChild(li);
        });
    }

    const alertMessage = (txt) => {
        return txt.endsWith("seconds ago") ? '🚨📢' : ''
    }

    function showBlockError() {
        var modal = document.getElementById("errorModal");
        var errorMessageElement = document.getElementById("errorMessage");
        const message = `This client is unable to send the heartbeat to the server! Your IP is trackable and account can be suspended`;
        errorMessageElement.textContent = message;
        modal.style.display = "block";
    }
    function closeErrorModal() {
        var modal = document.getElementById("errorModal");
        modal.style.display = "none";
    }

    this.document.getElementById("errorModal-close-btn").onclick = closeErrorModal

    const main = () => {
        if (isTabFocused()) {
            sendPingToServer()
                .then(({ status }) => {
                    if (status !== 200) {
                        showBlockError()
                    }
                })
                .catch(e => {
                    showBlockError()
                    console.error("Ping Error: ", e);
                });

            getAllUsersPing()
                .then(({ status, data }) => {
                    if (status === 200) {
                        document.getElementById('tab1').innerHTML = `Active Users (${data.length})`;
                        updateList(data.map(o => `${o.u} (${o.t}) ${alertMessage(o.t)}`));
                    } else {
                        showBlockError()
                    }
                })
                .catch(e => {
                    showBlockError()
                    console.error("Users Error: ", e)
                });
        }
    }

    setTimeout(main, 1000);
    setInterval(main, 4000);
})