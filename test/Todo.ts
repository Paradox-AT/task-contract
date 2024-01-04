import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Task App", () => {
  async function deployTaskFixture() {
    const [admin, user] = await ethers.getSigners();
    const Task = await ethers.getContractFactory("TaskContract");
    const taskApp = await Task.deploy();

    await taskApp.waitForDeployment()

    return { taskApp, admin, user };
  }

  describe("Deployment", () => {
    it("Should set the right admin", async () => {
      const { taskApp, admin } = await loadFixture(deployTaskFixture);
      expect(await taskApp.admin()).to.equal(admin.address);
    });
  });

  describe("Task Tasks", () => {
    it('should allow admin to create a task', async () => {
      const { taskApp, admin } = await loadFixture(deployTaskFixture);
      await taskApp.createTask('Task 1', 'Description 1');
      const task = await taskApp.tasks(1)

      expect(task[0]).to.equal(BigInt(1), "Task successfully created");
    });

    it('should allow admin to assign a task to a user', async () => {
      const { taskApp, user } = await loadFixture(deployTaskFixture);
      await taskApp.createTask('Task 1', 'Description 1');
      await taskApp.assignTask(1, user);
      const task = await taskApp.tasks(1)

      expect(task[3]).to.equal(user.address, 'Task should be assigned to the user');
    });

    it('should allow a user to mark a task as completed', async () => {
      const { taskApp, user } = await loadFixture(deployTaskFixture);
      await taskApp.createTask('Task 1', 'Description 1');
      await taskApp.assignTask(1, user.address);
      await taskApp.connect(user).markTaskCompleted(BigInt(1));
      const task = await taskApp.tasks(1)

      expect(task[4]).to.equal(BigInt(1), 'Status should be 1');
    });

    it('should not allow a non-admin to create a task', async () => {
      const { taskApp, user } = await loadFixture(deployTaskFixture);
      expect(taskApp.connect(user).createTask('Task 1', 'Description 1')).to.be.reverted
    });

    it('should not allow a non-admin to assign a task', async () => {
      const { taskApp, user } = await loadFixture(deployTaskFixture);
      await taskApp.createTask('Task 1', 'Description 1');

      expect(taskApp.connect(user).assignTask(1, user)).to.be.reverted
    });

    it('should not allow a user to mark a non-assigned task as completed', async () => {
      const { taskApp, user } = await loadFixture(deployTaskFixture);
      await taskApp.createTask('Task 1', 'Description 1');

      expect(taskApp.connect(user).markTaskCompleted(1)).to.be.reverted
    });

    it('should not allow a user to mark an already completed task', async () => {
      const { taskApp, user } = await loadFixture(deployTaskFixture);
      await taskApp.createTask('Task 1', 'Description 1');
      await taskApp.assignTask(1, user);
      await taskApp.connect(user).markTaskCompleted(1);

      expect(taskApp.connect(user).markTaskCompleted(1)).to.be.reverted
    });
  })
});
