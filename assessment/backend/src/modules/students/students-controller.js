const asyncHandler = require("express-async-handler");
const { getAllStudents, addNewStudent, getStudentDetail, setStudentStatus, updateStudent, deleteStudent } = require("./students-service");

const handleGetAllStudents = asyncHandler(async (req, res) => {
    const { name, className, section, roll } = req.query;
    const payload = { name, className, section, roll };
    
    try {
        const students = await getAllStudents(payload);
        res.json({ students });
    } catch (error) {
        // Enhanced error handling with proper status codes
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Failed to retrieve students';
        
        res.status(statusCode).json({ 
            success: false,
            error: message,
            timestamp: new Date().toISOString()
        });
    }
});

const handleAddStudent = asyncHandler(async (req, res) => {
    const payload = req.body;
    
    // Basic validation
    if (!payload.name || !payload.email) {
        return res.status(400).json({ 
            error: 'Name and email are required fields' 
        });
    }
    
    try {
        const result = await addNewStudent(payload);
        res.status(201).json({
            success: true,
            message: result.message,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Failed to add student';
        
        res.status(statusCode).json({ 
            success: false,
            error: message,
            timestamp: new Date().toISOString()
        });
    }
});

const handleUpdateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const payload = { ...req.body, userId: parseInt(id) };
    
    // Basic validation
    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ 
            error: 'Valid student ID is required' 
        });
    }
    
    try {
        const result = await updateStudent(payload);
        res.json({
            success: true,
            message: result.message,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Failed to update student';
        
        res.status(statusCode).json({ 
            success: false,
            error: message,
            timestamp: new Date().toISOString()
        });
    }
});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Basic validation
    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ 
            error: 'Valid student ID is required' 
        });
    }
    
    try {
        const student = await getStudentDetail(id);
        res.json(student);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Failed to retrieve student details';
        
        res.status(statusCode).json({ 
            success: false,
            error: message,
            timestamp: error.statusCode === 404 ? 'Student not found' : 'Failed to retrieve student details',
            timestamp: new Date().toISOString()
        });
    }
});

const handleStudentStatus = asyncHandler(async (req, res) => {
    const { id: userId } = req.params;
    const { status } = req.body;
    const { id: reviewerId } = req.user;
    
    // Enhanced validation
    if (!userId || isNaN(parseInt(userId))) {
        return res.status(400).json({ 
            error: 'Valid student ID is required' 
        });
    }
    
    if (status === undefined || ![0, 1].includes(status)) {
        return res.status(400).json({ 
            error: 'Status must be 0 (disabled) or 1 (enabled)' 
        });
    }
    
    if (!reviewerId) {
        return res.status(401).json({ 
            error: 'Reviewer ID is required' 
        });
    }
    
    try {
        const result = await setStudentStatus({ userId, reviewerId, status });
        res.json({
            success: true,
            message: result.message,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Failed to update student status';
        
        res.status(statusCode).json({ 
            success: false,
            error: message,
            timestamp: new Date().toISOString()
        });
    }
});

const handleDeleteStudent = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await deleteStudent({ userId: id, reviewerId: req.user?.id });
        
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
});

module.exports = {
    handleGetAllStudents,
    handleGetStudentDetail,
    handleAddStudent,
    handleStudentStatus,
    handleUpdateStudent,
    handleDeleteStudent,
};
