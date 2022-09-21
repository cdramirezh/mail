document.addEventListener('DOMContentLoaded', function() {

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

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

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

        // Create a <div> to show the data
        const email_frame = document.createElement('div')
        email_frame.innerHTML = `${sender} ${subject} ${timestamp}`
        // Do some fancy styling to the email_frame
        email_frame.className = 'email_frame'
        

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
