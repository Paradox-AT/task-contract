// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract TaskContract {
    address public admin;
    uint256 public taskIdCounter;

    enum TaskStatus { Pending, Completed }

    struct Task {
        uint256 id;
        string title;
        string description;
        address assignedUser;
        TaskStatus status;
    }

    mapping(uint256 => Task) public tasks;

    event TaskCreated(uint256 taskId, string title, string description, address assignedUser);
    event TaskAssigned(uint256 taskId, address assignedUser);
    event TaskReAssigned(uint256 taskId, address assignedUser);
    event TaskCompleted(uint256 taskId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
        taskIdCounter = 1;
    }

    function createTask(string memory _title, string memory _description) external onlyAdmin {
        tasks[taskIdCounter] = Task({
            id: taskIdCounter,
            title: _title,
            description: _description,
            assignedUser: address(0),
            status: TaskStatus.Pending
        });

        emit TaskCreated(taskIdCounter, _title, _description, address(0));
        taskIdCounter++;
    }

    function assignTask(uint256 _taskId, address _user) external onlyAdmin {
        require(tasks[_taskId].id != 0, "Task does not exist");
        require(tasks[_taskId].assignedUser == address(0), "Task already assigned");

        tasks[_taskId].assignedUser = _user;

        emit TaskAssigned(_taskId, _user);
    }

    function reAssignTask(uint256 _taskId, address _user) external onlyAdmin {
        require(tasks[_taskId].id != 0, "Task does not exist");
        require(tasks[_taskId].assignedUser != address(0), "Task not assigned");

        tasks[_taskId].assignedUser = _user;

        emit TaskReAssigned(_taskId, _user);
    }

    function markTaskCompleted(uint256 _taskId) external {
        require(tasks[_taskId].id != 0, "Task does not exist");
        require(tasks[_taskId].assignedUser == msg.sender, "Only assigned user can complete the task");
        require(tasks[_taskId].status == TaskStatus.Pending, "Task is already completed");

        tasks[_taskId].status = TaskStatus.Completed;

        emit TaskCompleted(_taskId);
    }
}
