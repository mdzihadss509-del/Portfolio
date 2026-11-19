# Portfolio quality checks

Run the browser and accessibility checks with:

    npm run test:e2e

Open the HTML report with:

    npx playwright show-report

The suite checks public navigation targets, theme surface colors, mobile overflow, critical accessibility issues, and the admin sign-in entry point. It does not submit real contact forms or mutate Supabase content.