// SPDX-License-IDentifier: MIT
pragma solidity ^0.8.18;

/**
 * This contract implements hashed timelock function for ETH swap on different EVM based chain;
 */
contract HTLC {

    event NewTransaction(
        bytes32 indexed txID,
        address indexed sender,
        address indexed receiver,
        uint amount,
        bytes32 hashlock,
        uint timelock
    );
    event Withdraw(bytes32 indexed txID);
    event Refund(bytes32 indexed txID);

    struct LockedTransaction {
        address payable sender;
        address payable receiver;
        uint256 amount;
        bytes32 hashlock;
        bytes32 preimage;
        uint32 timelock; // UNIX timestamp seconds - locked UNTIL this time
        bool withdrawn;
        bool refunded;
    }

    modifier txExists(bytes32 txID) {
        require(transactionExists(txID), "txID does not exist");
        _;
    }
    modifier hashlockValid(bytes32 txID, bytes32 preImage) {
        require(
            transactions[txID].hashlock == sha256(abi.encodePacked(preImage)),
            "hashlock hash does not match"
        );
        _;
    }
    modifier withdrawable(bytes32 txID) {
        require(transactions[txID].receiver == msg.sender, "only receiver can withdraw");
        require(transactions[txID].withdrawn == false, "tx is already withdraw");
        require(transactions[txID].timelock > block.timestamp, "timelock is expired");
        _;
    }
    modifier refundable(bytes32 txID) {
        require(transactions[txID].sender == msg.sender, "only sender can refund");
        require(transactions[txID].refunded == false, "tx is already refunded");
        require(transactions[txID].withdrawn == false, "tx is already withdrawn");
        require(transactions[txID].timelock <= block.timestamp, "timelock not passed yet");
        _;
    }

    mapping (bytes32 => LockedTransaction) transactions;
    mapping (address => bytes32[]) txIds;


    /**
     * @notice make a new hashed timelock transaction by _hashlock, used by not knowing the preImage
     * 
     * @param _receiver Receiver of the ETH.
     * @param _hashlock hashlock
     * @param _timelock UNIX epoch seconds time that the lock expires at.
     * 
     * @return txID of the new hashed time lock transaction. This is needed for subsequent
     *                    calls.
     */
    function newTransactionByHashLock(address payable _receiver, bytes32 _hashlock, uint32 _timelock)
        external
        payable
        returns (bytes32 txID)
    {
        require(msg.value > 0, "transfer amount must be greater than 0");
        require(_timelock > block.timestamp, "timelock must be in the future");
        txID = _newTransaction(msg.sender, _receiver, _hashlock, _timelock);
        txIds[msg.sender].push(txID);
    }

    function getLastTxId() external view returns(bytes32){
        bytes32[] memory ids = txIds[msg.sender];
        return ids[ids.length -1];
    }


    function _newTransaction(address _sender, address _receiver, 
    bytes32 _hashlock, uint32 _timelock)
        internal
        returns (bytes32 txID) 
    {
        txID = sha256(
            abi.encodePacked(
                _sender,
                _receiver,
                msg.value,
                _hashlock,
                _timelock
            )
        );

        // Reject if a contract already exists with the same parameters. The
        // sender must change one of these parameters to create a new distinct
        // contract.
        if (transactionExists(txID))
            revert("transaction already exists");

        transactions[txID] = LockedTransaction(
            payable(_sender),
            payable(_receiver),
            msg.value,
            _hashlock,
            0x0,
            _timelock,
            false,
            false
        );


        emit NewTransaction(
            txID,
            _sender,
            _receiver,
            msg.value,
            _hashlock,
            _timelock
        );
    }

    /**
     * @notice once know the preimage of the hashlock, receiver can call this function
     * to extract the locked token
     *
     * @param _txID hashed lock transaction ID.
     * @param _preimage sha256(_preimage) should equal the contract hashlock.
     * @return bool true on success
     */
    function withdraw(bytes32 _txID, bytes32 _preimage)
        external
        txExists(_txID)
        hashlockValid(_txID, _preimage)
        withdrawable(_txID)
        returns (bool)
    {
        LockedTransaction storage c = transactions[_txID];
        c.preimage = _preimage;
        c.withdrawn = true;
        c.receiver.transfer(c.amount);
        emit Withdraw(_txID);
        return true;
    }

    /**
     * @notice when timelock has expired, sender can call this function to retrieve 
     * their locked token.
     *
     * @param _txID hashed lock transaction ID.
     * @return bool true on success
     */
    function refund(bytes32 _txID)
        external
        txExists(_txID)
        refundable(_txID)
        returns (bool)
    {
        LockedTransaction storage c = transactions[_txID];
        c.refunded = true;
        c.sender.transfer(c.amount);
        emit Refund(_txID);
        return true;
    }

    /**
     * @dev Get transaction details by txID.
     * @param _txID  transaction ID
     */
    function getTransaction(bytes32 _txID)
        public
        view
        returns (
            address sender,
            address receiver,
            uint amount,
            bytes32 hashlock,
            uint timelock,
            bool withdrawn,
            bool refunded,
            bytes32 preimage
        )
    {
        if (transactionExists(_txID) == false)
            return (address(0), address(0), 0, 0, 0, false, false, 0);
        LockedTransaction storage c = transactions[_txID];
        return (
            c.sender,
            c.receiver,
            c.amount,
            c.hashlock,
            c.timelock,
            c.withdrawn,
            c.refunded,
            c.preimage
        );
    }

    /**
     * @dev Is there a contract with id _txID.
     * @param _txID ID into contracts mapping.
     */
    function transactionExists(bytes32 _txID)
        internal
        view
        returns (bool exists)
    {
        exists = (transactions[_txID].sender != address(0));
    }

}

