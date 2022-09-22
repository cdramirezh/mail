document.addEventListener('DOMContentLoaded', function() {

  // Add a werid second mailbox name to the top of the page just in case
  weird_double_mailbox_name = document.createElement('h3')
  weird_double_mailbox_name.setAttribute('id', 'weird_double_mailbox_name')
  document.querySelector('body').insertBefore(weird_double_mailbox_name, document.querySelector('body').firstChild)

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Define what to do with JS to compose-form
  document.querySelector('#compose-form').onsubmit = send_email

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  // Hide weird double mailbox name
  document.querySelector('#weird_double_mailbox_name').style.display = 'none';
  document.querySelector('title').innerHTML = 'Mail'

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  capitalized_mailbox_name = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${capitalized_mailbox_name}</h3>`;

  // Add the name of the mailbox to the top of the page Whatever that means
  document.querySelector('title').innerHTML = capitalized_mailbox_name
  // Just in case it doen't mean add it to the title but to the top of the body
  weird_double_mailbox_name = document.querySelector('#weird_double_mailbox_name')
  weird_double_mailbox_name.innerHTML = capitalized_mailbox_name
  weird_double_mailbox_name.style.display = 'block';

  // Query the API for the lastest emails in the mailbox
  const apy_query = `/emails/${mailbox}`
  fetch(apy_query)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(email => {
        id = email.id
        sender = email.sender
        recipients = email.recipients
        subject = email.subject
        body = email.body
        timestamp = email.timestamp
        read = email.read
        archived = email.archived

        // Create frames to show the data

        const sender_frame = document.createElement('div')
        sender_frame.classList.add('col-2', 'sender_frame')
        sender_frame.innerHTML = sender

        const subject_frame = document.createElement('div')
        subject_frame.classList.add('col-7')
        subject_frame.innerHTML = subject

        const timestamp_frame = document.createElement('div')
        timestamp_frame.classList.add('col-3', 'timestamp_frame')
        timestamp_frame.innerHTML = timestamp

        const email_frame = document.createElement('div')
        email_frame.classList.add('row', 'email_frame')
        email_frame.append(sender_frame, subject_frame, timestamp_frame)

        // If email is read, it appears with a gray background
        if (read) {email_frame.style.background = 'gray'}
        
        // Add a click handler to the email_frame

        // Append the <div> to the body
        document.querySelector('#emails-view').append(email_frame)
      });
  });

}


function send_email() {
  // Get the data from the form
  const recipients = document.querySelector('#compose-recipients').value
  const subject = document.querySelector('#compose-subject').value
  const body = document.querySelector('#compose-body').value
  console.log(`Data read: ${recipients} ${subject} ${body}`)

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });

  // Load the user's sent mailbox
  load_mailbox('sent');

  // I need the form not to reload the page
  return false
}
