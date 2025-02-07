import userModel from "../models/userModel.js";

export const creditWallet = async (req, res,next) => {
    const { userId, amount, description = "Wallet credit" } = req.body;
  
    try {
      // Find user by ID
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Add the amount to the user's wallet balance
      user.walletBalance += amount;
  
      // Log the transaction in wallet history
      user.walletTransactions.push({
        type: "CREDIT",
        amount,
        description,
      });
  
      // Save the user document
      await user.save();
  
      // Return updated wallet details
      res.status(200).json({
        message: "Wallet credited successfully",
        balance: user.walletBalance,
        transactions: user.walletTransactions,
      });
    } catch (error) {
      // Handle errors
     next(error)
    }
  };
  
  

 export const debitWallet = async (req,res,next) => {
    const { userId, amount } = req.body;

    try {
      // Perform wallet debit logic
      const user = await userModel.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      if (user.walletBalance < amount) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }
  
      user.walletBalance -= amount;
      user.walletTransactions.push({
        type: 'DEBIT',
        amount,
        description: 'Wallet debit',
      });
  
      await user.save();
      res.status(200).json({ message: 'Wallet debited successfully', balance: user.walletBalance });
    } catch (err) {
      next(err)
    }
  };
  
  export const purchaseUsingWallet = async (req, res, next) => {
    try {
      const { userId, totalAmount } = req.body; // Assuming user ID and total amount come from request body
  
      // Perform wallet debit
      const user = await debitWallet(userId, totalAmount, "Purchase using wallet");
  
      res.status(200).json({
        message: "Purchase successful",
        walletBalance: user.walletBalance,
        transactions: user.walletTransactions,
      });
    } catch (error) {
      next(error);
    }
  };

  export const refundWallet = async (req, res, next) => {
    try {
        
      const { userId, refundAmount } = req.body; // Assuming user ID and refund amount come from request body
  
      // Perform wallet credit
      const user = await creditWallet(userId, refundAmount, "Refund for order cancellation");
  
      res.status(200).json({
        message: "Refund successful",
        walletBalance: user.walletBalance,
        transactions: user.walletTransactions,
      });
    } catch (error) {
      next(error);
    }
  };
  
  export const getWalletDetails = async (req, res) => {
    try {
      const userId = req.user.id; // Assuming user ID is available in req.user
      const user = await userModel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({
        walletBalance: user.walletBalance,
        transactions: user.walletTransactions,
      });
    } catch (error) {
      console.error("Error fetching wallet details:", error);
      res.status(500).json({ message: "Failed to fetch wallet details" });
    }
  };


  
