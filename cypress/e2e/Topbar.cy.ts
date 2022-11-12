describe("test topbar render", () => {
	it("visit the home page", () => {
		cy.visit("http://localhost:3000/");

		cy.get(".logo").should("be.visible");

		cy.contains("Courses");
	});
});
