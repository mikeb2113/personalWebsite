document.addEventListener('DOMContentLoaded', () => {
    console.log("The page is fully loaded.");

    // Select all .note elements
    var noteButtons = document.querySelectorAll('.note');

    console.log("Note Buttons:", noteButtons); // Debugging

    // Function to toggle the associated dropdown content
    function toggleDropdown(event) {
        var targetId = event.currentTarget.getAttribute('data-target');
        var targetDiv = document.getElementById(targetId);
        console.log("Toggling Dropdown for:", targetId); // Debugging
        if (targetDiv) {
            targetDiv.classList.toggle('show');
        }
    }

    // Function to handle clicking outside the dropdown content
    function handleClickOutside(event) {
        if (!event.target.matches('.note')) {
            noteButtons.forEach(button => {
                var targetId = button.getAttribute('data-target');
                var targetDiv = document.getElementById(targetId);
                if (targetDiv && targetDiv.classList.contains('show')) {
                    targetDiv.classList.remove('show');
                }
            });
        }
    }

    // Initialize the toggle functionality for each .note button
    noteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent this click from being captured by the window event listener
            toggleDropdown(event);
        });
    });

    // Add event listener for clicks outside the dropdown content
    window.addEventListener('click', handleClickOutside);
});